import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return <main>
    <div className={styles.post}>
      {JSON.stringify(post)}
    </div>
  </main>
}

export const getStaticPaths = async () => {

  const prismic = getPrismicClient();
	const posts = await prismic.query([
		Prismic.predicates.at('document.type', 'posts')
	], {
		fetch: [
			'posts.uid',
		],
	});

  const postsToBeRendered = [
    'como-utilizar-hooks',
    'criando-um-app-cra-do-zero1'
  ]

  const paths = posts.results.reduce((postsArray, currentPost) => {
    if( postsToBeRendered.includes(currentPost.uid) )
      postsArray.push({
        params: {
          slug: currentPost.uid
        }
      })
    return postsArray
  }, [])  

  return { paths, fallback: true }

};

export const getStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {})

  const post = {
    uid: slug,
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
    }
  }

  return {
    props: {
      post
    }
  }

};
