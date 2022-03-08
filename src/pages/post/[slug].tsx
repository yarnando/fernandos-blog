import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useRouter } from 'next/router';

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

export default function Post({ post }: PostProps, {numberOfWords}) {

  const estimatedReadingTime = text => {
    
    const wordsCount = text.reduce( (wordsSum, content)  => {
      let headingWords = content.heading.split(/\s+/).length;
      wordsSum += headingWords
      content.body.forEach(bodyContent => {
        let bodyWords = bodyContent.text.split(/\s+/).length;
        wordsSum += bodyWords
      })
      return wordsSum
    }, 0)

    return Math.ceil(wordsCount/200)

  }

	function parseDate(date) {
		if(!date) return
		let parsedDate = parseISO(date)
		let formattedDate = format(
			parsedDate, 
			'dd MMM yyyy',
			{ locale: pt }
		  );	
		  
		return formattedDate
	}  

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }  

  return (
    <main>
      <section className={styles.bannerContainer}>
        <img
          src={post.data.banner.url}
          alt={`Banner ${post.data.title}`}
          className={styles.banner}
        />
      </section>
      <section className={styles.post}>
        <h1 className={styles.postTitle}>
          {post.data.title}
        </h1>
        <div className={styles.postInfo}>
          <span className={styles.postInfoFirstPubDate}>
            <FiCalendar className={styles.postInfoIcon} /> {parseDate(post.first_publication_date)}
          </span>
          <span className={styles.postInfoAuthor}>
            <FiUser className={styles.postInfoIcon} /> {post.data.author}
          </span>
          <span className={styles.postInfoAuthor}>
            <FiClock className={styles.postInfoIcon} /> {estimatedReadingTime(post.data.content)} min
          </span>
        </div>
        {
          post.data.content.map(content => {
            return (
              <section key={content.heading} className={styles.postContent}>
                <h2 className={styles.postSubTitle}>
                  {content.heading}
                </h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                ></div>                
              </section>
            )
          })
        }
      </section>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: [
      'posts.uid',
    ],
  });

  // const postsToBeRendered = [
  //   'como-utilizar-hooks',
  //   'criando-um-app-cra-do-zero1'
  // ]

  // const paths = posts.results.reduce((postsArray, currentPost) => {
  //   if (postsToBeRendered.includes(currentPost.uid))
  //     postsArray.push({
  //       params: {
  //         slug: currentPost.uid
  //       }
  //     })
  //   return postsArray
  // }, [])

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });  

  return { paths, fallback: true }

};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {})

  // console.log(JSON.stringify(response));


  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    }
  }
  
  return {
    props: {
      post,
    }
  }

};
