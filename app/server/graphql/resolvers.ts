const resolvers = {
  Query: {
    async getCompany(parent: void): Promise<{ name: string }> {
      return { name: '' };
    },
  },
};

export default resolvers;
