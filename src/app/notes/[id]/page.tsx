import { NoteDetail } from "./note-detail";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;

  return <NoteDetail noteId={id} />;
}
