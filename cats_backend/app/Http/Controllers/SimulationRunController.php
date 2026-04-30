<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationRun;
use App\Models\SimulationRunEvent;
use App\Models\SimulationStep;
use App\Support\CyberAwarenessAiCoach;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class SimulationRunController extends Controller
{
    public function start(Request $request, Simulation $simulation)
    {
        if (!$simulation->is_active) {
            return response()->json(['message' => 'Simulation is not available.'], 404);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        /** @var SimulationStep|null $firstStep */
        $firstStep = SimulationStep::with(['choices:id,step_id,next_step_id,text,sort_order'])
            ->where('simulation_id', $simulation->id)
            ->orderBy('step_order')
            ->first();

        if (!$firstStep) {
            return response()->json(['message' => 'Simulation has no steps configured.'], 400);
        }

        $run = SimulationRun::query()->create([
            'user_id' => $user->id,
            'simulation_id' => $simulation->id,
            'status' => 'in_progress',
            'time_limit_seconds' => $simulation->time_limit_seconds,
            'started_at' => Carbon::now(),
            'finished_at' => null,
            'score' => 0,
            'max_score' => $simulation->max_score,
            'current_step_id' => $firstStep->id,
        ]);

        $simulation->load(['category:id,slug,name']);

        return response()->json([
            'run' => $this->presentRun($run, $simulation, $firstStep),
        ]);
    }

    public function show(Request $request, SimulationRun $run)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'admin' && $run->user_id !== $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $simulation = $run->simulation()->with('category:id,slug,name')->firstOrFail();

        /** @var SimulationStep|null $step */
        $step = null;
        if ($run->current_step_id) {
            $step = SimulationStep::with(['choices:id,step_id,next_step_id,text,sort_order'])
                ->whereKey($run->current_step_id)
                ->first();
        }

        return response()->json([
            'run' => $this->presentRun($run, $simulation, $step),
        ]);
    }

    public function choose(Request $request, SimulationRun $run)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'admin' && $run->user_id !== $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($run->status !== 'in_progress') {
            return response()->json(['message' => 'Run is already finished.'], 400);
        }

        $validated = $request->validate([
            'choice_id' => ['required', 'integer'],
        ]);

        if ($run->time_limit_seconds && $run->started_at) {
            $elapsed = now()->diffInSeconds($run->started_at);
            if ($elapsed > $run->time_limit_seconds) {
                $run->status = 'expired';
                $run->finished_at = Carbon::now();
                $run->current_step_id = null;
                $run->save();

                $simulation = $run->simulation()->with('category:id,slug,name')->firstOrFail();

                return response()->json([
                    'run' => $this->presentRun($run, $simulation, null),
                    'outcome' => [
                        'message' => 'Time limit exceeded. Run expired.',
                    ],
                ]);
            }
        }

        if (!$run->current_step_id) {
            return response()->json(['message' => 'Run has no active step.'], 400);
        }

        /** @var SimulationStep $step */
        $step = SimulationStep::with(['choices'])
            ->whereKey($run->current_step_id)
            ->firstOrFail();

        /** @var SimulationChoice|null $choice */
        $choice = $step->choices->firstWhere('id', (int) $validated['choice_id']);
        if (!$choice) {
            return response()->json(['message' => 'Invalid choice for current step.'], 400);
        }

        SimulationRunEvent::query()->create([
            'run_id' => $run->id,
            'step_id' => $step->id,
            'choice_id' => $choice->id,
            'is_safe' => (bool) $choice->is_safe,
            'score_delta' => (int) $choice->score_delta,
        ]);

        $nextScore = (int) $run->score + (int) $choice->score_delta;
        if ($nextScore < 0)
            $nextScore = 0;
        if ($nextScore > (int) $run->max_score)
            $nextScore = (int) $run->max_score;

        $run->score = $nextScore;

        /** @var SimulationStep|null $nextStep */
        $nextStep = null;
        if ($choice->next_step_id) {
            $run->current_step_id = $choice->next_step_id;
            $run->save();

            $nextStep = SimulationStep::with(['choices:id,step_id,next_step_id,text,sort_order'])
                ->whereKey($choice->next_step_id)
                ->first();
        } else {
            $run->status = 'completed';
            $run->finished_at = Carbon::now();
            $run->current_step_id = null;
            $run->save();
        }

        $simulation = $run->simulation()->with('category:id,slug,name')->firstOrFail();

        $aiFeedback = null;
        $coachCtx = [
            'simulation_title' => $simulation->title,
            'step_prompt' => $step->prompt,
            'choice_text' => $choice->text,
            'explanation' => $choice->explanation,
        ];

        if (!(bool) $choice->is_safe) {
            $aiFeedback = CyberAwarenessAiCoach::coachUnsafeSimulation($coachCtx);
        } else {
            $aiFeedback = CyberAwarenessAiCoach::coachSafeSimulation($coachCtx);
        }

        return response()->json([
            'run' => $this->presentRun($run, $simulation, $nextStep),
            'outcome' => [
                'choice_id' => $choice->id,
                'is_safe' => (bool) $choice->is_safe,
                'score_delta' => (int) $choice->score_delta,
                'feedback' => $choice->feedback,
                'explanation' => $choice->explanation,
                'ai_feedback' => $aiFeedback,
            ],
        ]);
    }

    private function presentRun(SimulationRun $run, Simulation $simulation, ?SimulationStep $step)
    {
        $safeCount = SimulationRunEvent::query()->where('run_id', $run->id)->where('is_safe', true)->count();
        $unsafeCount = SimulationRunEvent::query()->where('run_id', $run->id)->where('is_safe', false)->count();

        return [
            'id' => $run->id,
            'status' => $run->status,
            'score' => $run->score,
            'max_score' => $run->max_score,
            'started_at' => optional($run->started_at)->toIso8601String(),
            'finished_at' => optional($run->finished_at)->toIso8601String(),
            'time_limit_seconds' => $run->time_limit_seconds,
            'simulation' => [
                'id' => $simulation->id,
                'title' => $simulation->title,
                'description' => $simulation->description,
                'difficulty' => $simulation->difficulty,
                'category' => $simulation->category?->only(['id', 'slug', 'name']),
            ],
            'current_step' => $step ? $this->presentStep($step) : null,
            'stats' => [
                'safe_choices' => (int) $safeCount,
                'unsafe_choices' => (int) $unsafeCount,
            ],
        ];
    }

    private function presentStep(SimulationStep $step)
    {
        return [
            'id' => $step->id,
            'title' => $step->title,
            'prompt' => $step->prompt,
            'education' => $step->education,
            'choices' => $step->choices
                ->sortBy('sort_order')
                ->map(fn($c) => [
                    'id' => $c->id,
                    'text' => $c->text,
                ])
                ->values(),
        ];
    }
}
