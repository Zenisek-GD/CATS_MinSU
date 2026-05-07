<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizQuestion;
use App\Models\Simulation;
use App\Models\SimulationStep;
use App\Models\SimulationChoice;
use App\Models\TrainingModule;
use App\Models\TrainingModuleTopic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Teacher-scoped content management.
 * All CRUD is restricted to content where created_by = auth()->id().
 */
class TeacherContentController extends Controller
{
    private function teacherId(): int
    {
        return Auth::id();
    }

    // ─── Modules ────────────────────────────────────────────────────────────────

    public function indexModules()
    {
        $modules = TrainingModule::with(['topics', 'quiz:id,title'])
            ->where('created_by', $this->teacherId())
            ->orderByDesc('id')
            ->get();

        return response()->json(['modules' => $modules]);
    }

    public function storeModule(Request $request)
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['nullable', 'boolean'],
            'quiz_id'     => ['nullable', 'integer', 'exists:quizzes,id'],
        ]);

        $module = TrainingModule::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
            'quiz_id'     => $validated['quiz_id'] ?? null,
            'created_by'  => $this->teacherId(),
        ]);

        return response()->json(['module' => $module], 201);
    }

    public function updateModule(Request $request, TrainingModule $module)
    {
        abort_if($module->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active'   => ['sometimes', 'boolean'],
            'quiz_id'     => ['sometimes', 'nullable', 'integer', 'exists:quizzes,id'],
        ]);

        $module->fill($validated)->save();
        return response()->json(['module' => $module]);
    }

    public function destroyModule(TrainingModule $module)
    {
        abort_if($module->created_by !== $this->teacherId(), 403, 'Unauthorized');
        $module->delete();
        return response()->json(['message' => 'Module deleted.']);
    }

    public function storeTopic(Request $request, TrainingModule $module)
    {
        abort_if($module->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'      => ['required', 'string', 'max:255'],
            'content'    => ['required', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $topic = $module->topics()->create([
            'title'      => $validated['title'],
            'content'    => $validated['content'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json(['topic' => $topic], 201);
    }

    public function updateTopic(Request $request, TrainingModuleTopic $topic)
    {
        $module = TrainingModule::findOrFail($topic->training_module_id);
        abort_if($module->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'      => ['sometimes', 'string', 'max:255'],
            'content'    => ['sometimes', 'string'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $topic->update($validated);
        return response()->json(['topic' => $topic]);
    }

    public function destroyTopic(TrainingModuleTopic $topic)
    {
        $module = TrainingModule::findOrFail($topic->training_module_id);
        abort_if($module->created_by !== $this->teacherId(), 403, 'Unauthorized');
        $topic->delete();
        return response()->json(['message' => 'Topic deleted.']);
    }

    // ─── Quizzes ─────────────────────────────────────────────────────────────────

    public function indexQuizzes()
    {
        $quizzes = Quiz::with(['category:id,slug,name'])
            ->withCount('questions')
            ->where('created_by', $this->teacherId())
            ->orderByDesc('id')
            ->get();

        return response()->json(['quizzes' => $quizzes]);
    }

    public function storeQuiz(Request $request)
    {
        $validated = $request->validate([
            'category_id'         => ['required', 'integer', 'exists:quiz_categories,id'],
            'title'               => ['required', 'string', 'max:255'],
            'description'         => ['nullable', 'string'],
            'kind'                => ['required', 'string', Rule::in(['regular', 'pretest', 'posttest'])],
            'difficulty'          => ['required', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds'  => ['nullable', 'integer', 'min:0'],
            'is_active'           => ['nullable', 'boolean'],
            'randomize_questions' => ['nullable', 'boolean'],
        ]);

        $quiz = Quiz::create(array_merge($validated, [
            'is_active'   => $validated['is_active'] ?? true,
            'created_by'  => $this->teacherId(),
        ]));

        $quiz->load('category:id,slug,name');
        return response()->json(['quiz' => $quiz], 201);
    }

    public function updateQuiz(Request $request, Quiz $quiz)
    {
        abort_if($quiz->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'category_id'        => ['sometimes', 'integer', 'exists:quiz_categories,id'],
            'title'              => ['sometimes', 'string', 'max:255'],
            'description'        => ['sometimes', 'nullable', 'string'],
            'kind'               => ['sometimes', 'string', Rule::in(['regular', 'pretest', 'posttest'])],
            'difficulty'         => ['sometimes', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_active'          => ['sometimes', 'boolean'],
        ]);

        $quiz->fill($validated)->save();
        $quiz->load('category:id,slug,name');
        return response()->json(['quiz' => $quiz]);
    }

    public function destroyQuiz(Quiz $quiz)
    {
        abort_if($quiz->created_by !== $this->teacherId(), 403, 'Unauthorized');
        foreach ($quiz->questions as $q) { $q->options()->delete(); }
        $quiz->questions()->delete();
        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted.']);
    }

    // Questions (scoped via quiz ownership)
    public function indexQuestions(Request $request)
    {
        $quizId = $request->get('quiz_id');
        $query  = QuizQuestion::with('options')
            ->whereHas('quiz', fn($q) => $q->where('created_by', $this->teacherId()));

        if ($quizId) $query->where('quiz_id', $quizId);

        return response()->json(['questions' => $query->orderBy('sort_order')->get()]);
    }

    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'quiz_id'     => ['required', 'integer', 'exists:quizzes,id'],
            'type'        => ['required', 'string'],
            'prompt'      => ['required', 'string'],
            'scenario'    => ['nullable', 'string'],
            'explanation' => ['nullable', 'string'],
            'points'      => ['nullable', 'integer', 'min:1'],
            'sort_order'  => ['nullable', 'integer'],
            'options'     => ['required', 'array', 'min:2'],
            'options.*.label'      => ['required', 'string'],
            'options.*.text'       => ['required', 'string'],
            'options.*.is_correct' => ['required', 'boolean'],
        ]);

        $quiz = Quiz::findOrFail($validated['quiz_id']);
        abort_if($quiz->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $question = $quiz->questions()->create([
            'type'        => $validated['type'],
            'prompt'      => $validated['prompt'],
            'scenario'    => $validated['scenario'] ?? null,
            'explanation' => $validated['explanation'] ?? null,
            'points'      => $validated['points'] ?? 1,
            'sort_order'  => $validated['sort_order'] ?? 0,
        ]);

        foreach ($validated['options'] as $i => $opt) {
            $question->options()->create([
                'label'      => $opt['label'],
                'text'       => $opt['text'],
                'is_correct' => $opt['is_correct'],
                'sort_order' => $i,
            ]);
        }

        $question->load('options');
        return response()->json(['question' => $question], 201);
    }

    public function updateQuestion(Request $request, QuizQuestion $question)
    {
        $quiz = Quiz::findOrFail($question->quiz_id);
        abort_if($quiz->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'type'        => ['sometimes', 'string'],
            'prompt'      => ['sometimes', 'string'],
            'scenario'    => ['sometimes', 'nullable', 'string'],
            'explanation' => ['sometimes', 'nullable', 'string'],
            'points'      => ['sometimes', 'integer', 'min:1'],
            'options'     => ['sometimes', 'array', 'min:2'],
            'options.*.label'      => ['required_with:options', 'string'],
            'options.*.text'       => ['required_with:options', 'string'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ]);

        $question->fill(collect($validated)->except('options')->toArray())->save();

        if (isset($validated['options'])) {
            $question->options()->delete();
            foreach ($validated['options'] as $i => $opt) {
                $question->options()->create([
                    'label' => $opt['label'], 'text' => $opt['text'],
                    'is_correct' => $opt['is_correct'], 'sort_order' => $i,
                ]);
            }
        }

        $question->load('options');
        return response()->json(['question' => $question]);
    }

    public function destroyQuestion(QuizQuestion $question)
    {
        $quiz = Quiz::findOrFail($question->quiz_id);
        abort_if($quiz->created_by !== $this->teacherId(), 403, 'Unauthorized');
        $question->options()->delete();
        $question->delete();
        return response()->json(['message' => 'Question deleted.']);
    }

    // ─── Simulations ─────────────────────────────────────────────────────────────

    public function indexSimulations()
    {
        $sims = Simulation::with(['category:id,slug,name', 'steps.choices'])
            ->where('created_by', $this->teacherId())
            ->orderByDesc('id')
            ->get();

        return response()->json(['simulations' => $sims]);
    }

    public function storeSimulation(Request $request)
    {
        $validated = $request->validate([
            'category_id'        => ['required', 'integer', 'exists:quiz_categories,id'],
            'title'              => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'difficulty'         => ['required', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds' => ['nullable', 'integer', 'min:0'],
            'max_score'          => ['nullable', 'integer', 'min:0'],
            'is_active'          => ['nullable', 'boolean'],
        ]);

        $sim = Simulation::create(array_merge($validated, [
            'max_score'  => $validated['max_score'] ?? 100,
            'is_active'  => $validated['is_active'] ?? true,
            'created_by' => $this->teacherId(),
        ]));

        $sim->load('category:id,slug,name');
        return response()->json(['simulation' => $sim], 201);
    }

    public function updateSimulation(Request $request, Simulation $simulation)
    {
        abort_if($simulation->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'              => ['sometimes', 'string', 'max:255'],
            'description'        => ['sometimes', 'nullable', 'string'],
            'difficulty'         => ['sometimes', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'max_score'          => ['sometimes', 'integer', 'min:0'],
            'is_active'          => ['sometimes', 'boolean'],
            'category_id'        => ['sometimes', 'integer', 'exists:quiz_categories,id'],
        ]);

        $simulation->fill($validated)->save();
        $simulation->load('category:id,slug,name');
        return response()->json(['simulation' => $simulation]);
    }

    public function destroySimulation(Simulation $simulation)
    {
        abort_if($simulation->created_by !== $this->teacherId(), 403, 'Unauthorized');
        foreach ($simulation->steps as $step) { $step->choices()->delete(); }
        $simulation->steps()->delete();
        $simulation->delete();
        return response()->json(['message' => 'Simulation deleted.']);
    }

    public function storeStep(Request $request, Simulation $simulation)
    {
        abort_if($simulation->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'      => ['required', 'string', 'max:255'],
            'prompt'     => ['required', 'string'],
            'education'  => ['nullable', 'string'],
            'step_order' => ['nullable', 'integer'],
        ]);

        $step = $simulation->steps()->create([
            'title'      => $validated['title'],
            'prompt'     => $validated['prompt'],
            'education'  => $validated['education'] ?? null,
            'step_order' => $validated['step_order'] ?? 0,
        ]);

        return response()->json(['step' => $step], 201);
    }

    public function updateStep(Request $request, SimulationStep $step)
    {
        $sim = Simulation::findOrFail($step->simulation_id);
        abort_if($sim->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'title'      => ['sometimes', 'string', 'max:255'],
            'prompt'     => ['sometimes', 'string'],
            'education'  => ['sometimes', 'nullable', 'string'],
            'step_order' => ['sometimes', 'integer'],
        ]);

        $step->update($validated);
        return response()->json(['step' => $step]);
    }

    public function destroyStep(SimulationStep $step)
    {
        $sim = Simulation::findOrFail($step->simulation_id);
        abort_if($sim->created_by !== $this->teacherId(), 403, 'Unauthorized');
        $step->choices()->delete();
        $step->delete();
        return response()->json(['message' => 'Step deleted.']);
    }

    public function storeChoice(Request $request, SimulationStep $step)
    {
        $sim = Simulation::findOrFail($step->simulation_id);
        abort_if($sim->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'text'         => ['required', 'string'],
            'is_safe'      => ['required', 'boolean'],
            'score_delta'  => ['required', 'integer'],
            'feedback'     => ['nullable', 'string'],
            'explanation'  => ['nullable', 'string'],
            'next_step_id' => ['nullable', 'integer', 'exists:simulation_steps,id'],
            'sort_order'   => ['nullable', 'integer'],
        ]);

        $choice = $step->choices()->create($validated);
        return response()->json(['choice' => $choice], 201);
    }

    public function updateChoice(Request $request, SimulationChoice $choice)
    {
        $step = SimulationStep::findOrFail($choice->step_id);
        $sim  = Simulation::findOrFail($step->simulation_id);
        abort_if($sim->created_by !== $this->teacherId(), 403, 'Unauthorized');

        $validated = $request->validate([
            'text'         => ['sometimes', 'string'],
            'is_safe'      => ['sometimes', 'boolean'],
            'score_delta'  => ['sometimes', 'integer'],
            'feedback'     => ['sometimes', 'nullable', 'string'],
            'explanation'  => ['sometimes', 'nullable', 'string'],
            'next_step_id' => ['sometimes', 'nullable', 'integer', 'exists:simulation_steps,id'],
            'sort_order'   => ['sometimes', 'integer'],
        ]);

        $choice->update($validated);
        return response()->json(['choice' => $choice]);
    }

    public function destroyChoice(SimulationChoice $choice)
    {
        $step = SimulationStep::findOrFail($choice->step_id);
        $sim  = Simulation::findOrFail($step->simulation_id);
        abort_if($sim->created_by !== $this->teacherId(), 403, 'Unauthorized');
        $choice->delete();
        return response()->json(['message' => 'Choice deleted.']);
    }

    // Shared: categories list (read-only, reuse admin categories)
    public function categories()
    {
        $cats = QuizCategory::orderBy('name')->get();
        return response()->json(['categories' => $cats]);
    }
}
