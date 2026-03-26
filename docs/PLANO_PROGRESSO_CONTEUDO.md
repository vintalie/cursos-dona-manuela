# Plano: Medição de Progresso com Conteúdo Interativo

Este documento descreve como medir o progresso do aluno quando o conteúdo da aula/matéria inclui **minigames**, **vídeos do YouTube** ou **áudio**, garantindo que o aluno complete/assista todo o conteúdo para contabilizar o progresso.

---

## Situação Atual

### O que já funciona
- **Aulas (lessons)**: Marcadas como concluídas ao navegar para a aula (`completeLesson`).
- **Avaliações (assessments)**: Marcadas ao enviar respostas com pontuação.
- **Progresso do curso**: Calculado como `(aulas concluídas + avaliações concluídas) / total * 100`.

### O que NÃO é verificado
- **Minigames embutidos**: O conteúdo HTML da aula pode ter iframes de minigames. O aluno pode marcar a aula como vista sem jogar.
- **Vídeos YouTube**: Se houver `<iframe>` do YouTube no conteúdo, não há verificação de que o vídeo foi assistido até o fim.
- **Áudio**: Não há rastreamento de reprodução de áudio.

---

## Proposta de Implementação

### 1. Minigames no Conteúdo da Aula

**Problema**: O editor Quill permite inserir minigames via iframe (`/minigame/play/:id`). O aluno pode ver a aula sem jogar.

**Solução**:
1. **Parser de conteúdo**: Ao carregar a aula, extrair todos os `src` de iframes que apontam para `/minigame/play/(\d+)/`.
2. **Registro de minigames por aula**: Criar tabela `lesson_minigame` (lesson_id, game_id) para rastrear quais minigames estão em cada aula.
3. **Evento de conclusão**: O MinigamePlayer (em iframe) já chama `completeGame` ao finalizar. Adicionar:
   - Quando o jogo é jogado **dentro de uma aula** (detectar via `document.referrer` ou parâmetro `?lesson_id=X` na URL),
   - Após `completeGame`, chamar endpoint `POST /courses/{course}/lessons/{lesson}/minigame-complete` com `game_id`.
4. **Condição para marcar aula**: A aula só pode ser marcada como concluída quando:
   - O usuário "visualizou" (navegou) E
   - Todos os minigames da aula foram jogados ao menos uma vez (com pontuação ≥ 0).

**Fluxo**:
```
Aluno abre aula com minigame → Navegação detecta aula
→ Frontend NÃO chama completeLesson automaticamente
→ Frontend verifica: aula tem minigames? Se sim, aguarda postMessage do iframe
→ Minigame envia postMessage("minigame-complete", { gameId, score }) ao finalizar
→ Frontend chama minigame-complete, depois verifica se todos foram feitos
→ Se todos feitos, aí sim chama completeLesson
```

### 2. Vídeos do YouTube

**Problema**: Vídeos podem ser embedados no HTML. Não há como saber se o aluno assistiu.

**Solução**:
1. **YouTube IFrame API**: Usar a API oficial do YouTube para embedar vídeos com eventos.
2. **Eventos a escutar**: `onStateChange` — estado `0` (ended) indica que o vídeo terminou.
3. **Parser de conteúdo**: Identificar iframes do YouTube (`youtube.com/embed/`, `youtu.be/`).
4. **Componente wrapper**: Criar `<YouTubeProgressTracker>` que:
   - Envolve o iframe do YouTube
   - Registra quando o vídeo chega a X% (ex: 90% ou 100%)
   - Chama callback `onVideoWatched(gameId ou videoId)` no parent
5. **Backend**: Tabela `lesson_video_progress` (user_id, lesson_id, video_id, watched_at).
6. **Condição para aula**: Todos os vídeos da aula devem ter `watched_at` preenchido.

**Alternativa mais simples**: Exigir que o vídeo chegue a 90% do tempo total antes de permitir marcar a aula. Usar `currentTime` e `duration` via postMessage (YouTube API).

### 3. Áudio

**Problema**: Áudio pode estar no conteúdo (tag `<audio>` ou embed).

**Solução**:
1. **Parser**: Identificar elementos `<audio src="...">` no HTML.
2. **Componente**: Criar `<AudioProgressTracker>` que:
   - Envolve o player de áudio
   - Escuta evento `ended` ou verifica `currentTime >= duration * 0.9`
   - Chama `onAudioListened(audioId)` no parent
3. **Backend**: Tabela `lesson_audio_progress` (user_id, lesson_id, audio_src_hash, listened_at).
4. **Condição**: Todos os áudios da aula devem ter sido ouvidos.

---

## Estrutura de Dados Proposta

### Novas tabelas (migrations)

```sql
-- Minigames vinculados a aulas (extraídos do conteúdo ou config explícita)
lesson_minigames: lesson_id, game_id

-- Progresso de minigame por aula (quando jogado dentro do contexto da aula)
lesson_minigame_progress: user_id, lesson_id, game_id, completed_at, score

-- Progresso de vídeo por aula
lesson_video_progress: user_id, lesson_id, video_id, watched_at, watch_percentage

-- Progresso de áudio por aula
lesson_audio_progress: user_id, lesson_id, audio_src_hash, listened_at
```

### Alteração no fluxo de completeLesson

**Antes**: `completeLesson` era chamado ao navegar para a aula.

**Depois**:
1. Frontend detecta que a aula tem "conteúdo obrigatório" (minigames, vídeos, áudio).
2. Se não tem: mantém comportamento atual (marca ao navegar).
3. Se tem: NÃO marca automaticamente. Mostra indicador "Complete o conteúdo para avançar".
4. Cada tipo de conteúdo reporta conclusão via callbacks.
5. Quando todos os itens obrigatórios forem concluídos, o frontend chama `completeLesson`.

---

## Ordem de Implementação Sugerida

1. **Fase 1 - Minigames** (prioridade alta)
   - Parser de iframes no conteúdo da aula
   - postMessage do MinigamePlayer para o parent
   - Endpoint `minigame-complete` no backend
   - Frontend: só chama completeLesson quando minigames da aula forem jogados

2. **Fase 2 - YouTube** (prioridade média)
   - Componente YouTubeProgressTracker
   - Integração com YouTube IFrame API
   - Backend para registrar conclusão de vídeo

3. **Fase 3 - Áudio** (prioridade menor)
   - Componente AudioProgressTracker
   - Backend para registrar conclusão de áudio

---

## Considerações Técnicas

### Detecção de minigame na aula
- O conteúdo é HTML (Quill). Iframes têm formato: `<iframe src=".../minigame/play/123" ...>`.
- Regex: `src="[^"]*\/minigame\/play\/(\d+)[^"]*"` para extrair game IDs.
- Ou: ao salvar a aula, o backend pode parsear e popular `lesson_minigames`.

### Segurança
- Validar que o `lesson_id` e `course_id` pertencem ao usuário matriculado.
- Validar que o `game_id` está de fato no conteúdo da aula.

### UX
- Mostrar progresso parcial: "1/2 minigames concluídos", "Vídeo: 45% assistido".
- Botão "Marcar como concluído" desabilitado até que tudo esteja feito.
- Ou: manter marcação automática ao navegar, mas adicionar "conteúdo opcional" que dá badges extras.

---

## Resumo

| Tipo de conteúdo | Como medir | Quando conta para progresso |
|------------------|------------|-----------------------------|
| Minigame (iframe) | postMessage ao finalizar jogo | Ao completar o jogo (score registrado) |
| Vídeo YouTube | YouTube API `onStateChange` (ended) ou 90% assistido | Ao chegar ao fim ou 90% |
| Áudio | Evento `ended` do elemento audio | Ao terminar de ouvir |

A implementação completa requer alterações no **CourseController**, **LessonContent**, **MinigamePlayer**, e criação de novos endpoints e tabelas.
