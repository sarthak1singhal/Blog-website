import Layout from '../../../components/Layout';
import ReadCaseStudies from '../../../components/crud/ReadCaseStudies/ReadCaseStudies';
import Private from "../../../components/auth/Private/Private";
import { isAuth } from "../../../actions/auth";


const CaseStudies = () => {
  const username = isAuth() && isAuth().username;

    return (
      <Layout>
        <Private>
            <ReadCaseStudies username={username} />
      </Private>
      </Layout>
    );
  };

export default CaseStudies;