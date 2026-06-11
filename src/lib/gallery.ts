// lib/gallery.ts
import { UIDSL } from './ui-schema';

export interface GalleryPost {
  id: string;
  prompt: string;
  dsl: UIDSL;
  style: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'UP' | 'DOWN';
  author: string;
}

const DEFAULT_POSTS: GalleryPost[] = [
  {
    id: 'post-1',
    author: 'StitchMaster',
    prompt: 'A modern, sleek dark login card with glassmorphic style and glowing input fields.',
    style: 'modern',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 42,
    downvotes: 1,
    dsl: {
      type: 'container',
      props: {
        padding: 'xl',
        direction: 'vertical',
        align: 'center',
        justify: 'center',
        style: { background: 'gradient-subtle', radius: 'lg' }
      },
      children: [
        {
          type: 'card',
          props: {
            title: 'Welcome Back',
            description: 'Enter your credentials to access your console.',
            variant: 'glass',
            padding: 'lg'
          },
          children: [
            {
              type: 'input',
              props: {
                label: 'Email Address',
                placeholder: 'hello@stitch.ai',
                type: 'email'
              }
            },
            {
              type: 'input',
              props: {
                label: 'Security Password',
                placeholder: '••••••••',
                type: 'password'
              }
            },
            {
              type: 'container',
              props: {
                direction: 'horizontal',
                justify: 'between',
                align: 'center',
                gap: 'xs'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    value: 'Forgot password?',
                    variant: 'muted'
                  }
                }
              ]
            },
            {
              type: 'button',
              props: {
                label: 'Authenticate Console',
                variant: 'primary',
                size: 'md'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'post-2',
    author: 'UX_Wizard',
    prompt: 'Fintech Dashboard overview card showing active balance, metrics, and transaction history.',
    style: 'modern',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    upvotes: 89,
    downvotes: 2,
    dsl: {
      type: 'container',
      props: {
        padding: 'lg',
        direction: 'vertical',
        gap: 'md',
        style: { background: 'default' }
      },
      children: [
        {
          type: 'container',
          props: {
            direction: 'horizontal',
            justify: 'between',
            align: 'center'
          },
          children: [
            {
              type: 'text',
              props: {
                value: 'Financial Ledger',
                variant: 'h3'
              }
            },
            {
              type: 'badge',
              props: {
                label: 'Live Updates',
                variant: 'success'
              }
            }
          ]
        },
        {
          type: 'container',
          props: {
            direction: 'grid',
            cols: 3,
            gap: 'md'
          },
          children: [
            {
              type: 'card',
              props: {
                title: '$14,250.80',
                description: 'Total Portfolio Balance',
                variant: 'default',
                padding: 'md'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    value: '+12.4% this month',
                    variant: 'success'
                  }
                }
              ]
            },
            {
              type: 'card',
              props: {
                title: '$4,120.50',
                description: 'Monthly Expenses',
                variant: 'default',
                padding: 'md'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    value: '-2.1% from limit',
                    variant: 'muted'
                  }
                }
              ]
            },
            {
              type: 'card',
              props: {
                title: '98.4%',
                description: 'Invested Capital',
                variant: 'default',
                padding: 'md'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    value: 'High efficiency allocation',
                    variant: 'small'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'table',
          props: {
            headers: ['Merchant', 'Date', 'Amount', 'Status'],
            rows: [
              { Merchant: 'AWS Cloud Services', Date: 'May 24, 2026', Amount: '$1,240.00', Status: 'Processed' },
              { Merchant: 'Vercel hosting', Date: 'May 22, 2026', Amount: '$40.00', Status: 'Processed' },
              { Merchant: 'GitHub CoPilot', Date: 'May 19, 2026', Amount: '$19.00', Status: 'Processed' }
            ],
            variant: 'striped'
          }
        }
      ]
    }
  }
];

export function getGalleryPosts(): GalleryPost[] {
  if (typeof window === 'undefined') return DEFAULT_POSTS;
  
  try {
    const data = localStorage.getItem('ai-ui-gallery');
    if (!data) {
      localStorage.setItem('ai-ui-gallery', JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load gallery posts', e);
    return DEFAULT_POSTS;
  }
}

export function saveGalleryPost(prompt: string, dsl: UIDSL, style: string = 'modern', author: string = 'LocalDesigner'): GalleryPost[] {
  if (typeof window === 'undefined') return DEFAULT_POSTS;

  const newPost: GalleryPost = {
    id: `post-${Date.now()}`,
    author,
    prompt,
    dsl,
    style,
    createdAt: new Date().toISOString(),
    upvotes: 1,
    downvotes: 0,
  };

  try {
    const posts = getGalleryPosts();
    const updated = [newPost, ...posts];
    localStorage.setItem('ai-ui-gallery', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save gallery post', e);
    return DEFAULT_POSTS;
  }
}

export function toggleGalleryVote(postId: string, voteType: 'UP' | 'DOWN'): GalleryPost[] {
  if (typeof window === 'undefined') return DEFAULT_POSTS;

  try {
    const posts = getGalleryPosts();
    const updated = posts.map(post => {
      if (post.id !== postId) return post;

      let upvotes = post.upvotes;
      let downvotes = post.downvotes;
      let userVote = post.userVote;

      if (userVote === voteType) {
        // Undo vote
        if (voteType === 'UP') upvotes = Math.max(0, upvotes - 1);
        else downvotes = Math.max(0, downvotes - 1);
        userVote = undefined;
      } else {
        // Switch or apply vote
        if (userVote === 'UP') upvotes = Math.max(0, upvotes - 1);
        if (userVote === 'DOWN') downvotes = Math.max(0, downvotes - 1);

        if (voteType === 'UP') upvotes += 1;
        else downvotes += 1;
        
        userVote = voteType;
      }

      return {
        ...post,
        upvotes,
        downvotes,
        userVote
      };
    });

    localStorage.setItem('ai-ui-gallery', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to vote on post', e);
    return DEFAULT_POSTS;
  }
}
