import { useState } from 'react';

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

	const [nextPage, setNextPage] = useState(postsPagination.next_page)
	const [results, setResults] = useState(postsPagination.results)

	async function getMorePosts() {
		
		if (!nextPage) return

		let response = await fetch(nextPage).then((res => res.json()))
		setNextPage(response.next_page)
		setResults([...results, ...response.results.map((post): Post => {
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
		})]
		)

	}

	return (
		<>
			<Head>
				<title>Home | CeifardBlog</title>
			</Head>
			<main className={styles.container}>
				{results.map(post => (
					<Link href={`/posts/${post.uid}`} key={post.uid}>
						<a className={styles.post}>
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

				{nextPage && <a className={styles.loadMorePosts} onClick={getMorePosts}>
					Carregar mais posts
				</a>}
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
		pageSize: 5
	});

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
