export type Friend = {
  id: string;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
  muted?: boolean;
};

export const generateFriends = (page: number, pageSize: number): Friend[] => {
  return Array.from({ length: pageSize }).map((_, i) => {
    const id = `${page}-${i}`;
    return {
      id,
      name: `User ${id}`,
      message: 'Last message preview goes here...',
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      online: Math.random() > 0.5,
      muted: false,
    };
  });
};
