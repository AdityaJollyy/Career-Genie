export default async function CoverLetterPage({ params }) {
  const { id } = await params;
  return <div>CoverLetterPage: {id}</div>;
}
