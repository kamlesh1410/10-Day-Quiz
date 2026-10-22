import { AvatarOption } from '../types';

export const KAHOOT_AVATARS: AvatarOption[] = [
  { id: 'kahoot_1', name: 'Bear', role: 'Operator', image: '/assets/kahoot/kahoot_1.png' },
  { id: 'kahoot_2', name: 'Moose', role: 'Operator', image: '/assets/kahoot/kahoot_2.png' },
  { id: 'kahoot_3', name: 'Pug', role: 'Operator', image: '/assets/kahoot/kahoot_3.png' },
  { id: 'kahoot_4', name: 'Cat', role: 'Operator', image: '/assets/kahoot/kahoot_4.png' },
  { id: 'kahoot_5', name: 'Mouse', role: 'Operator', image: '/assets/kahoot/kahoot_5.png' },
  { id: 'kahoot_6', name: 'Bunny', role: 'Operator', image: '/assets/kahoot/kahoot_6.png' },
  { id: 'kahoot_7', name: 'Fox', role: 'Operator', image: '/assets/kahoot/kahoot_7.png' },
  { id: 'kahoot_8', name: 'Wolf', role: 'Operator', image: '/assets/kahoot/kahoot_8.png' },
  { id: 'kahoot_9', name: 'Raccoon', role: 'Operator', image: '/assets/kahoot/kahoot_9.png' },
  { id: 'kahoot_10', name: 'Panda', role: 'Operator', image: '/assets/kahoot/kahoot_10.png' },
  { id: 'kahoot_11', name: 'Frog', role: 'Operator', image: '/assets/kahoot/kahoot_11.png' },
  { id: 'kahoot_12', name: 'Owl', role: 'Operator', image: '/assets/kahoot/kahoot_12.png' },
  { id: 'kahoot_13', name: 'Chick', role: 'Operator', image: '/assets/kahoot/kahoot_13.png' },
  { id: 'kahoot_14', name: 'Parrot', role: 'Operator', image: '/assets/kahoot/kahoot_14.png' },
  { id: 'kahoot_15', name: 'Penguin', role: 'Operator', image: '/assets/kahoot/kahoot_15.png' },
  { id: 'kahoot_16', name: 'Yeti', role: 'Operator', image: '/assets/kahoot/kahoot_16.png' },
  { id: 'kahoot_17', name: 'Snowman', role: 'Operator', image: '/assets/kahoot/kahoot_17.png' },
  { id: 'kahoot_18', name: 'Llama', role: 'Operator', image: '/assets/kahoot/kahoot_18.png' },
  { id: 'kahoot_19', name: 'Tiger', role: 'Operator', image: '/assets/kahoot/kahoot_19.png' },
  { id: 'kahoot_20', name: 'Koala', role: 'Operator', image: '/assets/kahoot/kahoot_20.png' },
  { id: 'kahoot_21', name: 'Kangaroo', role: 'Operator', image: '/assets/kahoot/kahoot_21.png' },
  { id: 'kahoot_22', name: 'Horse', role: 'Operator', image: '/assets/kahoot/kahoot_22.png' },
  { id: 'kahoot_23', name: 'Unicorn', role: 'Operator', image: '/assets/kahoot/kahoot_23.png' },
  { id: 'kahoot_24', name: 'Dragon', role: 'Operator', image: '/assets/kahoot/kahoot_24.png' },
  { id: 'kahoot_25', name: 'Monster', role: 'Operator', image: '/assets/kahoot/kahoot_25.png' },
  { id: 'kahoot_26', name: 'Pinky', role: 'Operator', image: '/assets/kahoot/kahoot_26.png' },
  { id: 'kahoot_27', name: 'Brain', role: 'Operator', image: '/assets/kahoot/kahoot_27.png' },
  { id: 'kahoot_28', name: 'Zombie', role: 'Operator', image: '/assets/kahoot/kahoot_28.png' },
  { id: 'kahoot_29', name: 'Skeleton', role: 'Operator', image: '/assets/kahoot/kahoot_29.png' },
  { id: 'kahoot_30', name: 'Earth', role: 'Operator', image: '/assets/kahoot/kahoot_30.png' },
];

export const AVATARS = KAHOOT_AVATARS;

export function getAvatarImage(avatarId: string): string {
  // Support legacy or direct index
  if (avatarId && avatarId.startsWith('kahoot_')) {
    const found = KAHOOT_AVATARS.find((a) => a.id === avatarId);
    if (found) return found.image;
  }
  if (avatarId && avatarId.startsWith('avatar_')) {
    const num = parseInt(avatarId.replace('avatar_', ''), 10) || 1;
    const target = KAHOOT_AVATARS[(num - 1) % KAHOOT_AVATARS.length];
    return target.image;
  }
  return KAHOOT_AVATARS[0].image;
}
