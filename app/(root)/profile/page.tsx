import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Collection } from '@/components/shared/Collection';
import Header from '@/components/shared/Header';
import { getUserImages } from '@/actions/image.action';
import { getUserById } from '@/actions/user.action';

const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user?.id || '' });

  const transformedImages = images?.data.map((image) => ({
    ...image,
    publicId: image.publicId || '',
    width: image.width ?? undefined, // Replace null with undefined
    height: image.height ?? undefined, // Replace null with undefined
    secureURL: image.secureURL || '',
    transformationUrl: image.transformationUrl ?? undefined, // Replace null with undefined
    aspectRatio: image.aspectRatio ?? undefined, // Replace null with undefined
    color: image.color ?? undefined, // Replace null with undefined
    prompt: image.prompt ?? undefined, // Replace null with undefined
    author: image.author
      ? {
          id: image.author.id,
          username: image.author.userName || 'Unknown', // Add a default username
          firstName: image.author.firstName ?? undefined,
          lastName: image.author.lastName ?? undefined,
        }
      : undefined,
    authorId: image.authorId || '',
    createdAt: image.createdAt || new Date(),
    updatedAt: image.updatedAt || new Date(),
  }));

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user?.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection
          images={transformedImages || []}
          totalPages={images?.totalPage || 1}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;
