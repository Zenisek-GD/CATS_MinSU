<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationStep;
use App\Models\SimulationVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSimulationController extends Controller
{
    public function index()
    {
        $simulations = Simulation::query()
            ->with(['category:id,slug,name', 'steps.choices', 'videos'])
            ->orderByDesc('id')
            ->get();

        return response()->json(['simulations' => $simulations]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:quiz_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'time_limit_seconds' => ['nullable', 'integer', 'min:0'],
            'max_score' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $simulation = Simulation::query()->create([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'difficulty' => $validated['difficulty'],
            'time_limit_seconds' => $validated['time_limit_seconds'] ?? null,
            'max_score' => $validated['max_score'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $simulation->load(['category:id,slug,name']);

        return response()->json(['simulation' => $simulation], 201);
    }

    public function update(Request $request, Simulation $simulation)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'difficulty' => ['sometimes', 'in:easy,medium,hard'],
            'time_limit_seconds' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'max_score' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'category_id' => ['sometimes', 'integer', 'exists:quiz_categories,id'],
        ]);

        $simulation->fill($validated);
        $simulation->save();
        $simulation->load(['category:id,slug,name', 'steps.choices']);

        return response()->json(['simulation' => $simulation]);
    }

    public function destroy(Simulation $simulation)
    {
        foreach ($simulation->steps as $step) {
            $step->choices()->delete();
        }
        $simulation->steps()->delete();
        $simulation->delete();

        return response()->json(['message' => 'Simulation deleted.']);
    }

    // ─── Step CRUD ───

    public function storeStep(Request $request, Simulation $simulation)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'prompt' => ['required', 'string'],
            'education' => ['nullable', 'string'],
            'step_order' => ['nullable', 'integer'],
        ]);

        $maxOrder = $simulation->steps()->max('step_order') ?? 0;

        $step = SimulationStep::query()->create([
            'simulation_id' => $simulation->id,
            'step_order' => $validated['step_order'] ?? ($maxOrder + 1),
            'title' => $validated['title'],
            'prompt' => $validated['prompt'],
            'education' => $validated['education'] ?? null,
        ]);

        $step->load('choices');

        return response()->json(['step' => $step], 201);
    }

    public function updateStep(Request $request, SimulationStep $step)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'prompt' => ['sometimes', 'string'],
            'education' => ['sometimes', 'nullable', 'string'],
            'step_order' => ['sometimes', 'integer'],
        ]);

        $step->fill($validated);
        $step->save();
        $step->load('choices');

        return response()->json(['step' => $step]);
    }

    public function destroyStep(SimulationStep $step)
    {
        $step->choices()->delete();
        $step->delete();

        return response()->json(['message' => 'Step deleted.']);
    }

    // ─── Choice CRUD ───

    public function storeChoice(Request $request, SimulationStep $step)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
            'is_safe' => ['required', 'boolean'],
            'score_delta' => ['required', 'integer'],
            'feedback' => ['nullable', 'string'],
            'explanation' => ['nullable', 'string'],
            'next_step_id' => ['nullable', 'integer', 'exists:simulation_steps,id'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $maxOrder = $step->choices()->max('sort_order') ?? 0;

        $choice = SimulationChoice::query()->create([
            'step_id' => $step->id,
            'next_step_id' => $validated['next_step_id'] ?? null,
            'text' => $validated['text'],
            'is_safe' => $validated['is_safe'],
            'score_delta' => $validated['score_delta'],
            'feedback' => $validated['feedback'] ?? null,
            'explanation' => $validated['explanation'] ?? null,
            'sort_order' => $validated['sort_order'] ?? ($maxOrder + 1),
        ]);

        return response()->json(['choice' => $choice], 201);
    }

    public function updateChoice(Request $request, SimulationChoice $choice)
    {
        $validated = $request->validate([
            'text' => ['sometimes', 'string'],
            'is_safe' => ['sometimes', 'boolean'],
            'score_delta' => ['sometimes', 'integer'],
            'feedback' => ['sometimes', 'nullable', 'string'],
            'explanation' => ['sometimes', 'nullable', 'string'],
            'next_step_id' => ['sometimes', 'nullable', 'integer'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $choice->fill($validated);
        $choice->save();

        return response()->json(['choice' => $choice]);
    }

    public function destroyChoice(SimulationChoice $choice)
    {
        $choice->delete();

        return response()->json(['message' => 'Choice deleted.']);
    }

    // ─── Video CRUD ───

    public function indexVideos(Simulation $simulation)
    {
        return response()->json(['videos' => $simulation->videos()->get()]);
    }

    public function storeVideo(Request $request, Simulation $simulation)
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'video_url'   => ['nullable', 'string', 'max:2000'],
            'video_file'  => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime', 'max:204800'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $path = null;
        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('simulation-videos', 'public');
        }

        $maxOrder = $simulation->videos()->max('sort_order') ?? 0;

        $video = SimulationVideo::create([
            'simulation_id' => $simulation->id,
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'video_url'     => $validated['video_url'] ?? null,
            'video_path'    => $path,
            'sort_order'    => $validated['sort_order'] ?? ($maxOrder + 1),
        ]);

        return response()->json(['video' => $video], 201);
    }

    public function updateVideo(Request $request, SimulationVideo $video)
    {
        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'video_url'   => ['sometimes', 'nullable', 'string', 'max:2000'],
            'video_file'  => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime', 'max:204800'],
            'sort_order'  => ['sometimes', 'integer', 'min:0'],
        ]);

        if ($request->hasFile('video_file')) {
            // Delete old local file if exists
            if ($video->video_path) {
                Storage::disk('public')->delete($video->video_path);
            }
            $validated['video_path'] = $request->file('video_file')->store('simulation-videos', 'public');
        }

        $video->fill($validated);
        $video->save();

        return response()->json(['video' => $video]);
    }

    public function destroyVideo(SimulationVideo $video)
    {
        if ($video->video_path) {
            Storage::disk('public')->delete($video->video_path);
        }
        $video->delete();

        return response()->json(['message' => 'Video deleted.']);
    }
}
