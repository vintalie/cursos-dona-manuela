<?php

namespace App\Http\Controllers;

use App\Models\MediaCategory;
use Illuminate\Http\Request;

class MediaCategoryController extends Controller
{
    public function index()
    {
        try {
            $this->authorize('viewAny', MediaCategory::class);
            return MediaCategory::orderBy('name')->get();
        } catch (\Throwable $e) {
            \Log::error('MediaCategory index error', ['exception' => $e]);
            return response()->json([
                'message' => 'Erro ao carregar categorias. Verifique se as migrations foram executadas (php artisan migrate).',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $this->authorize('create', MediaCategory::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return MediaCategory::create($validated);
    }

    public function destroy(MediaCategory $mediaCategory)
    {
        $this->authorize('delete', $mediaCategory);

        $mediaCategory->media()->update(['media_category_id' => null]);
        $mediaCategory->delete();

        return response()->json(['message' => 'Categoria de mídia removida']);
    }
}
