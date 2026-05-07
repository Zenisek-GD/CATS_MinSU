<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\QuizAttempt;
use App\Models\SimulationRun;
use App\Models\UserModuleProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class TeacherReportController extends Controller
{
    public function classroom(Request $request, Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        [$from, $to] = $this->parseDateRange($request);
        $data = $this->buildClassroomReportData($classroom, $from, $to);

        $format = strtolower((string) $request->query('format', 'json'));
        if ($format === 'csv') {
            return $this->csvResponse(
                $this->classroomRowsForCsv($data),
                'classroom-' . $classroom->id . '-report.csv'
            );
        }

        return response()->json($data);
    }

    public function summary(Request $request)
    {
        $teacher = Auth::user();

        [$from, $to] = $this->parseDateRange($request);

        $classrooms = Classroom::query()
            ->where('teacher_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'teacher_id', 'name', 'code', 'status', 'created_at']);

        $classroomSummaries = [];
        $totals = [
            'classrooms' => $classrooms->count(),
            'students' => 0,
            'modules_assigned' => 0,
            'quizzes_assigned' => 0,
            'simulations_assigned' => 0,
        ];

        $accModulePct = 0.0;
        $accQuizPct = 0.0;
        $accSimPct = 0.0;
        $countWithStudents = 0;

        foreach ($classrooms as $classroom) {
            $report = $this->buildClassroomReportData($classroom, $from, $to);
            $summary = $report['summary'] ?? [];
            $classTotals = $report['totals'] ?? [];

            $totals['students'] += (int) ($classTotals['students'] ?? 0);
            $totals['modules_assigned'] += (int) ($classTotals['modules_assigned'] ?? 0);
            $totals['quizzes_assigned'] += (int) ($classTotals['quizzes_assigned'] ?? 0);
            $totals['simulations_assigned'] += (int) ($classTotals['simulations_assigned'] ?? 0);

            $studentsCount = (int) ($classTotals['students'] ?? 0);
            if ($studentsCount > 0) {
                $countWithStudents++;
                $accModulePct += (float) ($summary['avg_module_completion_percent'] ?? 0);
                $accQuizPct += (float) ($summary['avg_quiz_percent'] ?? 0);
                $accSimPct += (float) ($summary['avg_simulation_percent'] ?? 0);
            }

            $classroomSummaries[] = [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'code' => $classroom->code,
                'status' => $classroom->status,
                'students' => (int) ($classTotals['students'] ?? 0),
                'avg_module_completion_percent' => (float) ($summary['avg_module_completion_percent'] ?? 0),
                'avg_quiz_percent' => (float) ($summary['avg_quiz_percent'] ?? 0),
                'avg_simulation_percent' => (float) ($summary['avg_simulation_percent'] ?? 0),
            ];
        }

        $avg = [
            'avg_module_completion_percent' => $countWithStudents > 0 ? round($accModulePct / $countWithStudents, 1) : 0.0,
            'avg_quiz_percent' => $countWithStudents > 0 ? round($accQuizPct / $countWithStudents, 1) : 0.0,
            'avg_simulation_percent' => $countWithStudents > 0 ? round($accSimPct / $countWithStudents, 1) : 0.0,
        ];

        $data = [
            'generated_at' => now()->toIso8601String(),
            'totals' => $totals,
            'averages' => $avg,
            'classrooms' => $classroomSummaries,
        ];

        $format = strtolower((string) $request->query('format', 'json'));
        if ($format === 'csv') {
            return $this->csvResponse(
                $this->summaryRowsForCsv($data),
                'teacher-summary-report.csv'
            );
        }

        return response()->json($data);
    }

    private function parseDateRange(Request $request): array
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $from = isset($validated['from']) && $validated['from'] !== null
            ? Carbon::parse($validated['from'])->startOfDay()
            : null;

        $to = isset($validated['to']) && $validated['to'] !== null
            ? Carbon::parse($validated['to'])->endOfDay()
            : null;

        return [$from, $to];
    }

    private function buildClassroomReportData(Classroom $classroom, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $moduleIds = $classroom->modules()->pluck('training_modules.id')->values()->all();
        $quizIds = $classroom->quizzes()->pluck('quizzes.id')->values()->all();
        $simulationIds = $classroom->simulations()->pluck('simulations.id')->values()->all();

        $students = $classroom->students()
            ->get(['users.id', 'users.name', 'users.email', 'users.xp', 'users.last_login_at']);

        $studentIds = $students->pluck('id')->values()->all();

        $moduleProgress = UserModuleProgress::query()
            ->select(['user_id', 'training_module_id', 'is_completed'])
            ->whereIn('user_id', $studentIds)
            ->when(count($moduleIds) > 0, fn ($q) => $q->whereIn('training_module_id', $moduleIds), fn ($q) => $q->whereRaw('1 = 0'))
            ->when($from, fn ($q) => $q->where('updated_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('updated_at', '<=', $to))
            ->get();

        $quizAttempts = QuizAttempt::query()
            ->select(['user_id', 'quiz_id', 'percent', 'finished_at'])
            ->whereIn('user_id', $studentIds)
            ->when(count($quizIds) > 0, fn ($q) => $q->whereIn('quiz_id', $quizIds), fn ($q) => $q->whereRaw('1 = 0'))
            ->whereNotNull('finished_at')
            ->when($from, fn ($q) => $q->where('finished_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('finished_at', '<=', $to))
            ->orderBy('finished_at', 'desc')
            ->get();

        $simulationRuns = SimulationRun::query()
            ->select(['user_id', 'simulation_id', 'score', 'max_score', 'finished_at'])
            ->whereIn('user_id', $studentIds)
            ->when(count($simulationIds) > 0, fn ($q) => $q->whereIn('simulation_id', $simulationIds), fn ($q) => $q->whereRaw('1 = 0'))
            ->whereNotNull('finished_at')
            ->when($from, fn ($q) => $q->where('finished_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('finished_at', '<=', $to))
            ->orderBy('finished_at', 'desc')
            ->get();

        $completedModulesByUser = [];
        foreach ($moduleProgress as $row) {
            if (!$row->is_completed) {
                continue;
            }
            $completedModulesByUser[$row->user_id] = ($completedModulesByUser[$row->user_id] ?? 0) + 1;
        }

        $quizAggByUser = [];
        foreach ($quizAttempts as $attempt) {
            $userId = (int) $attempt->user_id;
            $pct = $attempt->percent !== null ? (float) $attempt->percent : null;
            if (!isset($quizAggByUser[$userId])) {
                $quizAggByUser[$userId] = [
                    'count' => 0,
                    'sum' => 0.0,
                    'last' => null,
                ];
            }
            if ($pct === null) {
                continue;
            }
            $quizAggByUser[$userId]['count']++;
            $quizAggByUser[$userId]['sum'] += $pct;
            if ($quizAggByUser[$userId]['last'] === null) {
                $quizAggByUser[$userId]['last'] = $pct;
            }
        }

        $simAggByUser = [];
        foreach ($simulationRuns as $run) {
            $userId = (int) $run->user_id;
            $max = (int) ($run->max_score ?? 0);
            $score = (int) ($run->score ?? 0);
            $pct = $max > 0 ? ($score / $max) * 100.0 : null;

            if (!isset($simAggByUser[$userId])) {
                $simAggByUser[$userId] = [
                    'count' => 0,
                    'sum' => 0.0,
                    'last' => null,
                ];
            }
            if ($pct === null) {
                continue;
            }
            $simAggByUser[$userId]['count']++;
            $simAggByUser[$userId]['sum'] += $pct;
            if ($simAggByUser[$userId]['last'] === null) {
                $simAggByUser[$userId]['last'] = $pct;
            }
        }

        $studentRows = [];

        $accModulePct = 0.0;
        $accQuizPct = 0.0;
        $accSimPct = 0.0;
        $studentsCount = $students->count();

        foreach ($students as $student) {
            $sid = (int) $student->id;

            $modulesTotal = count($moduleIds);
            $modulesCompleted = (int) ($completedModulesByUser[$sid] ?? 0);
            $modulePct = $modulesTotal > 0 ? round(($modulesCompleted / $modulesTotal) * 100.0, 1) : 0.0;

            $quizCount = (int) ($quizAggByUser[$sid]['count'] ?? 0);
            $quizAvg = $quizCount > 0 ? round(($quizAggByUser[$sid]['sum'] ?? 0.0) / $quizCount, 1) : 0.0;
            $quizLast = $quizAggByUser[$sid]['last'] ?? null;
            $quizLast = $quizLast !== null ? round((float) $quizLast, 1) : null;

            $simCount = (int) ($simAggByUser[$sid]['count'] ?? 0);
            $simAvg = $simCount > 0 ? round(($simAggByUser[$sid]['sum'] ?? 0.0) / $simCount, 1) : 0.0;
            $simLast = $simAggByUser[$sid]['last'] ?? null;
            $simLast = $simLast !== null ? round((float) $simLast, 1) : null;

            $accModulePct += $modulePct;
            $accQuizPct += $quizAvg;
            $accSimPct += $simAvg;

            $studentRows[] = [
                'id' => $sid,
                'name' => $student->name,
                'email' => $student->email,
                'xp' => (int) ($student->xp ?? 0),
                'last_login_at' => $student->last_login_at?->toIso8601String(),
                'modules' => [
                    'completed' => $modulesCompleted,
                    'total' => $modulesTotal,
                    'percent' => $modulePct,
                ],
                'quizzes' => [
                    'attempts_completed' => $quizCount,
                    'avg_percent' => $quizAvg,
                    'last_percent' => $quizLast,
                ],
                'simulations' => [
                    'runs_completed' => $simCount,
                    'avg_percent' => $simAvg,
                    'last_percent' => $simLast,
                ],
            ];
        }

        $summary = [
            'avg_module_completion_percent' => $studentsCount > 0 ? round($accModulePct / $studentsCount, 1) : 0.0,
            'avg_quiz_percent' => $studentsCount > 0 ? round($accQuizPct / $studentsCount, 1) : 0.0,
            'avg_simulation_percent' => $studentsCount > 0 ? round($accSimPct / $studentsCount, 1) : 0.0,
        ];

        return [
            'generated_at' => now()->toIso8601String(),
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'code' => $classroom->code,
                'status' => $classroom->status,
            ],
            'totals' => [
                'students' => $studentsCount,
                'modules_assigned' => count($moduleIds),
                'quizzes_assigned' => count($quizIds),
                'simulations_assigned' => count($simulationIds),
            ],
            'summary' => $summary,
            'students' => $studentRows,
        ];
    }

    private function csvResponse(array $rows, string $filename)
    {
        $handle = fopen('php://temp', 'r+');

        if (!empty($rows)) {
            fputcsv($handle, array_keys($rows[0]));
            foreach ($rows as $row) {
                fputcsv($handle, array_values($row));
            }
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function classroomRowsForCsv(array $report): array
    {
        $classroom = $report['classroom'] ?? [];

        $rows = [];
        foreach (($report['students'] ?? []) as $s) {
            $rows[] = [
                'classroom_id' => (string) ($classroom['id'] ?? ''),
                'classroom_name' => (string) ($classroom['name'] ?? ''),
                'student_id' => (string) ($s['id'] ?? ''),
                'student_name' => (string) ($s['name'] ?? ''),
                'student_email' => (string) ($s['email'] ?? ''),
                'xp' => (string) ($s['xp'] ?? 0),
                'last_login_at' => (string) ($s['last_login_at'] ?? ''),
                'modules_completed' => (string) (($s['modules']['completed'] ?? 0)),
                'modules_total' => (string) (($s['modules']['total'] ?? 0)),
                'modules_percent' => (string) (($s['modules']['percent'] ?? 0)),
                'quiz_attempts_completed' => (string) (($s['quizzes']['attempts_completed'] ?? 0)),
                'quiz_avg_percent' => (string) (($s['quizzes']['avg_percent'] ?? 0)),
                'quiz_last_percent' => (string) (($s['quizzes']['last_percent'] ?? '')),
                'simulation_runs_completed' => (string) (($s['simulations']['runs_completed'] ?? 0)),
                'simulation_avg_percent' => (string) (($s['simulations']['avg_percent'] ?? 0)),
                'simulation_last_percent' => (string) (($s['simulations']['last_percent'] ?? '')),
            ];
        }

        return $rows;
    }

    private function summaryRowsForCsv(array $summary): array
    {
        $rows = [];
        foreach (($summary['classrooms'] ?? []) as $c) {
            $rows[] = [
                'classroom_id' => (string) ($c['id'] ?? ''),
                'classroom_name' => (string) ($c['name'] ?? ''),
                'classroom_code' => (string) ($c['code'] ?? ''),
                'status' => (string) ($c['status'] ?? ''),
                'students' => (string) ($c['students'] ?? 0),
                'avg_module_completion_percent' => (string) ($c['avg_module_completion_percent'] ?? 0),
                'avg_quiz_percent' => (string) ($c['avg_quiz_percent'] ?? 0),
                'avg_simulation_percent' => (string) ($c['avg_simulation_percent'] ?? 0),
            ];
        }

        return $rows;
    }
}
