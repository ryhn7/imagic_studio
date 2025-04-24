import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import Header from '@/components/shared/Header';
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/actions/user.action';
import { getImageById } from '@/actions/image.action';

const Page = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const user = await getUserById(userId);
  const image = await getImageById(id);

  const transformedImage = image
    ? {
        ...image.image,
        publicId: image.image.publicId || '',
        width: image.image.width ?? undefined, // Replace null with undefined
        height: image.image.height ?? undefined, // Replace null with undefined
        secureURL: image.image.secureURL || '',
        transformationUrl: image.image.transformationUrl ?? undefined, // Replace null with undefined
        aspectRatio: image.image.aspectRatio ?? undefined, // Replace null with undefined
        color: image.image.color ?? undefined, // Replace null with undefined
        prompt: image.image.prompt ?? undefined, // Replace null with undefined
        authorId: image.image.authorId || '',
        createdAt: image.image.createdAt || new Date(),
        updatedAt: image.image.updatedAt || new Date(),
      }
    : undefined;

  const transformation =
    transformationTypes[
      image?.image.transformationType as TransformationTypeKey
    ];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user?.id || ''}
          type={image?.image.transformationType as TransformationTypeKey}
          creditBalance={user?.creditBalance || 0}
          config={image?.image.config || null}
          data={transformedImage}
        />
      </section>
    </>
  );
};

export default Page;
