import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = (props: HeaderProps) => {
  const { title, subtitle } = props;

  return (
    <>
      <h2 className="h2-bold text-dark-600">{title}</h2>
      {subtitle && <p className="p-16-regular mt-4">{subtitle}</p>}
    </>
  );
};

export default Header;
