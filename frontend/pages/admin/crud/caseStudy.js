import Layout from '../../../components/Layout';
import Admin from '../../../components/auth/Admin';
import CreateCaseStudy from '../../../components/crud/CreateCaseStudy/CreateCaseStudy';


const CaseStudy = () => {
    return (
      <Layout>
        <Admin>
            <CreateCaseStudy />
        </Admin>
      </Layout>
    );
  };

export default CaseStudy;