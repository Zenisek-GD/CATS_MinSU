<?php

namespace App\Http\Controllers;

use App\Models\Simulation;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'difficulty' => ['nullable', 'in:easy,medium,hard'],
        ]);

        $query = Simulation::query()
            ->with(['category:id,slug,name'])
            ->where('is_active', true)
            ->orderBy('id');

        if (!empty($validated['category'])) {
            $query->whereHas('category', fn($q) => $q->where('slug', $validated['category']));
        }

        if (!empty($validated['difficulty'])) {
            $query->where('difficulty', $validated['difficulty']);
        }

        $simulations = $query->get([
            'id',
            'category_id',
            'title',
            'description',
            'difficulty',
            'time_limit_seconds',
            'max_score',
            'is_active',
            'created_at',
        ]);

        return response()->json([
            'simulations' => $simulations,
        ]);
    }

    public function show(Request $request, Simulation $simulation)
    {
        if (!$simulation->is_active) {
            return response()->json(['message' => 'Simulation is not available.'], 404);
        }

        $simulation->load(['category:id,slug,name', 'videos']);

        return response()->json([
            'simulation' => [
                'id'                  => $simulation->id,
                'title'               => $simulation->title,
                'description'         => $simulation->description,
                'difficulty'          => $simulation->difficulty,
                'time_limit_seconds'  => $simulation->time_limit_seconds,
                'max_score'           => $simulation->max_score,
                'category'            => $simulation->category,
                'videos'              => $simulation->videos,
            ],
        ]);
    }
}
