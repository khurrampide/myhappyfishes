import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { mySanityClient, urlFor } from "../../sanity";
import { Post } from "../../typing";
import { GetStaticProps } from "next";
import Image from "next/image";
import PortableText from "react-portable-text";

interface Props {
  post: Post;
}

const Post = ({ post }: Props) => {
  return (
    <div>
      <Header />
      {/* Main Image */}
      <Image
        className="w-full h-96 object-cover"
        src={urlFor(post.mainImage).url()!}
        width={400}
        height={400}
        alt="Main Image"
      />
      {/* Article */}
      <div className="max-w-5xl mx-auto ">
        <article className="w-full mx-auto p-5 ">
          <h1 className="font-titleFont font-medium text-[32px] text-primary border-b-[1px] border-b-cyan-800 mt-10 mb-3">{post.title}</h1>
          <h2 className="font-bodyFont">{post.description}</h2>
          {/* <div className="flex items-center gap-2">
            <Image className="rounded-full object-cover w-12 h-12" width={48} height={48} src={urlFor(post.mainImage).url()! } alt="Profile Image" />
            <p className="font-bodyFont text-base">Blog Post by <span className="font-bold text-secondaryColor">{post.author.name} </span> Published at {new Date(post.publishedAt).toLocaleDateString()}</p>
          </div> */}
          <div className="mt-10">
            <PortableText
                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}
                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hj4h71er"}
                content={post.body}
                serializers={{
                    h1: (props:any) => (
                        <h1 className="text-3xl font-bold my-5 font-titleFont" {...props} />
                    ),
                    h2: (props:any) => (
                        <h1 className="text-2xl font-bold my-5 font-titleFont" {...props} />
                    ),
                    h3: (props:any) => (
                        <h1 className="text-2xl font-bold my-5 font-titleFont" {...props} />
                    ),
                    link:({href, children}:any) => (
                        <a href={href} className="text-blue-700 hover:underline">{children}</a>
                    ),
                    li: ({ children }: any) => (
                        <li className="ml-4 list-disc? list-decimal">
                          {" "}
                          {children}
                        </li>
                      ),
                }}
            />

          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type == 'post']{
        _id,
        slug{
            current
        }
     }`;
  const posts = await mySanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
          publishedAt,
          title,
          author->{
            name,
            image,
          },
          description,
          mainImage,
          slug,
          body
      }`;

  const post = await mySanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
  };
};
