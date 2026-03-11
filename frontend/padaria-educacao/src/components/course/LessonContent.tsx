interface LessonProps {
  title: string;
  content: string;
}

export default function LessonContent({ title, content }: LessonProps) {
  return (
    <div className="lesson-card">
      <h1>{title}</h1>
      <p style={{ whiteSpace: "pre-line" }}>{content}</p>
    </div>
  );
}
