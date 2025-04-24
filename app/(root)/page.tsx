import { navLinks } from '@/constants';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/components/shared/Collection';
import { getAllImages } from '@/actions/image.action';

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';

  const images = await getAllImages({ page, searchQuery });

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
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection
          hasSearch={true}
          images={transformedImages || []}
          totalPages={images?.totalPage || 1}
          page={page}
        />
      </section>
    </>
  );
};

export default Home;
