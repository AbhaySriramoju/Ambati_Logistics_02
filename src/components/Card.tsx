import React from "react";

const Card = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="bg-white shadow-md rounded-lg p-5 flex items-center space-x-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default Card;
