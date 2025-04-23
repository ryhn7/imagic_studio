import { getUserById } from '@/actions/user.action';
import Header from '@/components/shared/Header';
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async (props: SearchParamProps) => {
  const { params } = props;
  const { userId } = await auth();
  const transformation = transformationTypes[params.type];

  if (!userId) redirect('/sign-in');

  const user = userId ? await getUserById(userId) : null;

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user?.id || ''}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user?.creditBalance || 0}
        />
      </section>


    </>
  );
};

export default AddTransformationTypePage;
