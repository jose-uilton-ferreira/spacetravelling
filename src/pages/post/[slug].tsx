import { asHTML } from '@prismicio/helpers';
import { RTNode } from '@prismicio/types';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';

import Header from '../../components/Header';
import { calculateMinutesForReading } from '../../helpers/calculateMinutesForReading';
import { formatDate } from '../../helpers/formatDate';

import { getPrismicClient } from '../../services/prismic';

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

interface PostFormatted {
  first_publication_date: string | null;
  minutesForReading: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  let postFormatted: PostFormatted = null;

  if (post) {
    postFormatted = {
      first_publication_date: formatDate(post.first_publication_date),
      minutesForReading: calculateMinutesForReading(post.data.content),
      data: {
        title: post.data.title,
        banner: { url: post.data.banner.url },
        author: post.data.author,
        content: post.data.content.map(section => ({
          heading: section.heading,
          body: asHTML(section.body as [RTNode, ...RTNode[]]),
        })),
      },
    };
  }

  if (router.isFallback) {
    console.log('oi');
    return <div>Carregando...</div>;
  }

  return (
    postFormatted && (
      <>
        <Header />

        <div className={styles.banner}>
          <img src={postFormatted.data.banner.url} alt="Banner" />
        </div>

        <main className={commonStyles.container}>
          <article className={styles.post}>
            <header className={styles.postHeader}>
              <h1>{postFormatted.data.title}</h1>

              <div className={styles.postMetaDatas}>
                <div>
                  <FiCalendar />
                  <time>{postFormatted.first_publication_date}</time>
                </div>

                <div>
                  <FiUser />
                  {postFormatted.data.author}
                </div>

                <div>
                  <FiClock />
                  {postFormatted.minutesForReading}
                </div>
              </div>
            </header>

            <div className={styles.postContent}>
              {postFormatted.data.content.map(section => (
                <section>
                  <h2>{section.heading}</h2>

                  <div dangerouslySetInnerHTML={{ __html: section.body }} />
                </section>
              ))}
            </div>
          </article>
        </main>
      </>
    )
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 10,
  });

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(params.slug));

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
