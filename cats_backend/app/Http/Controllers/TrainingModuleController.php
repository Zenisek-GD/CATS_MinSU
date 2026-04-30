<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use Illuminate\Http\Request;

class TrainingModuleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = TrainingModule::query()->orderBy('id');

        if ($user && $user->role !== 'admin') {
            $query->where('is_active', true);
        }

        $modules = $query->get(['id', 'title', 'description', 'is_active', 'created_at']);

        return response()->json(['modules' => $modules]);
    }
}
