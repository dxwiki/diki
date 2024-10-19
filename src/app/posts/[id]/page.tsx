import PostDetail from '@/components/server/posts/PostDetail';

interface Props {
  params: { id: string }
}

export default async function PostPage({ params }: Props) {
  return (
    <>
      <PostDetail id={params.id} />
    </>
  );
}