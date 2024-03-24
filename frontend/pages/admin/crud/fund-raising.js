import Layout from '../../../components/Layout';
import Admin from '../../../components/auth/Admin';
import CreateFundRaisingBlog from '../../../components/crud/CreateFundRaisingBlog/CreateFundRaisingBlog';


const FundRaising = () => {
  return (
    <Layout>
      <Admin>
        <CreateFundRaisingBlog />
      </Admin>
    </Layout>
  );
};

export default FundRaising;