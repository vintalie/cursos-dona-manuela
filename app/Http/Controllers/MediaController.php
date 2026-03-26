<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    private const TYPE_MAP = [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'video' => ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        'audio' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp3'],
        'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'],
    ];

    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Media::class);

            $query = Media::with(['user', 'mediaCategory']);

            $user = auth()->user();
            if ($user->tipo === 'aluno') {
                $query->where('user_id', $user->id);
            } elseif ($request->filled('source')) {
                $source = $request->source;
                if ($source === 'gerente') {
                    $query->whereHas('user', fn ($q) => $q->where('tipo', 'gerente'));
                } elseif ($source === 'aluno') {
                    $query->whereHas('user', fn ($q) => $q->where('tipo', 'aluno'));
                }
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('category_id')) {
                $query->where('media_category_id', $request->category_id);
            }

            return $query->orderByDesc('created_at')->paginate($request->get('per_page', 15));
        } catch (\Throwable $e) {
            \Log::error('Media index error', ['exception' => $e]);
            return response()->json([
                'message' => 'Erro ao carregar mídias. Verifique se as migrations foram executadas (php artisan migrate).',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $this->authorize('create', Media::class);

        $validated = $request->validate([
            'file' => 'required|file|max:51200', // 50MB
            'media_category_id' => 'nullable|exists:media_categories,id',
        ]);

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        $type = $this->resolveType($mimeType);

        $user = auth()->user();
        if ($user->tipo === 'aluno' && $type !== 'image') {
            return response()->json(['message' => 'Alunos podem enviar apenas imagens.'], 403);
        }

        $year = now()->format('Y');
        $month = now()->format('m');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = "media/{$year}/{$month}/{$filename}";

        $storedPath = Storage::disk('public')->putFileAs(
            "media/{$year}/{$month}",
            $file,
            $filename
        );

        // Use relative URL so frontend can resolve with correct API base (port/host)
        $url = '/storage/' . $storedPath;

        $media = Media::create([
            'user_id' => $user->id,
            'media_category_id' => $validated['media_category_id'] ?? null,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => $storedPath,
            'url' => $url,
            'mime_type' => $mimeType,
            'type' => $type,
            'size' => $file->getSize(),
        ]);

        return response()->json($media->load(['user', 'mediaCategory']), 201);
    }

    public function update(Request $request, Media $media)
    {
        $this->authorize('update', $media);

        $validated = $request->validate([
            'media_category_id' => 'nullable|exists:media_categories,id',
        ]);

        $media->update($validated);

        return response()->json($media->load(['user', 'mediaCategory']));
    }

    public function destroy(Media $media)
    {
        $this->authorize('delete', $media);

        Storage::disk('public')->delete($media->path);
        $media->delete();

        return response()->json(['message' => 'Mídia removida']);
    }

    private function resolveType(string $mimeType): string
    {
        foreach (self::TYPE_MAP as $type => $mimes) {
            if (in_array($mimeType, $mimes)) {
                return $type;
            }
        }
        return 'document';
    }
}
