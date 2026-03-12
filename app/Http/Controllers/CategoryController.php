<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Category::class);
        return Category::all();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return Category::create($validated);
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->courses()->update(['category_id' => null]);
        $category->delete();

        return response()->json(['message' => 'Categoria removida']);
    }
}
