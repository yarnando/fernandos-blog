import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

import { FiCalendar, FiUser } from 'react-icons/fi'

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

export default function Home({ postsPagination }: HomeProps) {

	let { next_page, results } = postsPagination

	return (
		<>
			<Head>
				<title>Home | CeifardBlog</title>
			</Head>
			<main className={styles.container}>
				{results.map(post => (
					<Link href={`/posts/${post.uid}`}>
						<a key={post.uid} className={styles.post}>
							<h2 className={styles.postTitle}>
								{post.data.title}
							</h2>
							<h3 className={styles.postSubtitle}>
								{post.data.subtitle}
							</h3>
							<div className={styles.postInfo}>
								<span className={styles.postInfoFirstPubDate}>
									<FiCalendar className={styles.postInfoIcon} /> {post.first_publication_date}
								</span>
								<span className={styles.postInfoAuthor}>
									<FiUser className={styles.postInfoIcon} /> {post.data.author}
								</span>
							</div>
						</a>
					</Link>
				))}
			</main>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const prismic = getPrismicClient();
	const postsResponse = await prismic.query([
		Prismic.predicates.at('document.type', 'posts')
	], {
		fetch: [
			'posts.title',
			'posts.subtitle',
			'posts.author',
			'posts.banner',
			'posts.content'
		],
		pageSize: 20
	});

	// console.log(JSON.parse(JSON.stringify(postsResponse)))

	const next_page = postsResponse.next_page
	const results = postsResponse.results.map((post): Post => {
		return {
			uid: post.uid,
			first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			}),
			data: {
				title: post.data.title,
				subtitle: post.data.subtitle,
				author: post.data.author,
			}
		}
	})

	console.log(results);

	const postsPagination = {
		next_page,
		results
	}

	return {
		props: {
			postsPagination
		}
	}
};
