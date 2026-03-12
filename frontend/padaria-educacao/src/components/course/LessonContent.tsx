interface LessonProps {
  title: string;
  content: string;
}

export default function LessonContent({ title, content }: LessonProps) {
  return (
    <div className="lesson-card">
      <h1>{title}</h1>
      <div
        className="lesson-content prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content || "Sem conteúdo." }}
      />
    </div>
  );
}
