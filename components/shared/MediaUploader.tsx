/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { getImageSize, dataUrl } from '@/lib/utils';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

interface MediaUploaderProps {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<any>;
  publicId: string;
  image: any;
  type: string;
}

const MediaUploader = (props: MediaUploaderProps) => {
  const { onValueChange, setImage, publicId, image, type } = props;

  const { toast } = useToast();

  const onUploadSuccessHandler = (result: any) => {
    
    setImage((prevState: any) => ({
      ...prevState,
      publicId: result?.info?.public_id,
      width: result?.info?.width,
      height: result?.info?.height,
      secureUrl: result?.info?.secure_url,
    }));

    toast({
      title: 'Image uploaded successfully.',
      description: 'You can now use this image in your transformations.',
      duration: 5000,
      className: 'success-toast',
    });

    onValueChange(result?.info?.public_id);
  };

  const onUploadErrorHandler = () => {
    toast({
      title: 'Something went wrong while uploading the image.',
      description: 'Please try again.',
      duration: 5000,
      variant: 'destructive',
    });
  };

  return (
    <CldUploadWidget
      uploadPreset="imagic_studio"
      options={{
        multiple: false,
        resourceType: 'image',
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => {
        return (
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>
            {publicId ? (
              <div className="cursor-pointer.overflow-hidden.rounded-[10px]">
                <CldImage
                  width={getImageSize(type, image, 'width')}
                  height={getImageSize(type, image, 'height')}
                  src={publicId}
                  alt="Image"
                  sizes={'(max-width: 767px) 100vw, 50vw'}
                  placeholder={dataUrl as PlaceholderValue}
                  className="media-uploader_cldImage"
                />
              </div>
            ) : (
              <div className="media-uploader_cta" onClick={() => open()}>
                <div className="media-uploader_cta-image">
                  <Image
                    src="/assets/icons/add.svg"
                    alt="Add Image"
                    width={24}
                    height={24}
                  />
                </div>
                <p className="p-14-medium">Click here to upload image</p>
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
};

export default MediaUploader;
