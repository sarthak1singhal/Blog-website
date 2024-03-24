import Layout from '../../../components/Layout';
import Admin from '../../../components/auth/Admin';
import ReadFundRaisingBlogs from '../../../components/crud/ReadFundRaisingBlogs/ReadFundRaisingBlogs';

const FundRaisingBlogs = () => {
    return (
      <Layout>
        <Admin>
            <ReadFundRaisingBlogs />
        </Admin>
      </Layout>
    );
  };

export default FundRaisingBlogs