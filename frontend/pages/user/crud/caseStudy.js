import Layout from '../../../components/Layout';
import Private from "../../../components/auth/Private/Private";
import CreateCaseStudy from '../../../components/crud/CreateCaseStudy/CreateCaseStudy';


const CaseStudy = () => {
    return (
      <Layout>
        <Private>
            <CreateCaseStudy />
        </Private>

      </Layout>
    );
  };

export default CaseStudy;