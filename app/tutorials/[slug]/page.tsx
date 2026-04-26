import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getTutorial } from "@/lib/tutorials/registry";

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tutorial = getTutorial(params.slug);
  if (!tutorial) return { title: "Not found" };
  return {
    title: tutorial.title,
    description: tutorial.description,
  };
}

export default function TutorialPage({ params }: Params) {
  const tutorial = getTutorial(params.slug);
  if (!tutorial) notFound();
  const { Component } = tutorial;
  return <Component />;
}
