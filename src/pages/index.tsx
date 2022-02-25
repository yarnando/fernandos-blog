import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination } : HomeProps) {
  return (
      <>
          <Head>
              <title>Home | CeifardBlog</title>
          </Head>
          {postsPagination}
          {/* <main className={styles.container}>
              <div className={styles.posts}>
                  {posts.map(post => (
                      <Link href={`/posts/${post.slug}`}>
                          <a key={post.slug}>
                              <time>
                                  {post.updatedAt}
                              </time>
                              <strong>{post.title}</strong>
                              <p>{post.excerpt}</p>
                          </a>
                      </Link>
                  ))}
              </div>
          </main> */}
      </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [
      'posts.title', 
      'posts.author', 
      'posts.banner', 
      'posts.content'
    ],
    pageSize: 20
  });

  const posts = postsResponse.results.map(post => {
    console.log(JSON.parse(JSON.stringify(post.data)))
    return {
      slug: post.uid,
      title: post.data.title,
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    }
  }
};
