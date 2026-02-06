import React from "react";

const Loading = () => {
  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="space-y-4">
        <div className="h-6 w-40 bg-light-300 rounded" />
        <div className="h-10 w-full bg-light-300 rounded" />
        <div className="h-64 w-full bg-light-300 rounded" />
      </div>
    </section>
  );
};

export default Loading;
