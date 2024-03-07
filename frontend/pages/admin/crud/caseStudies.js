import Layout from '../../../components/Layout';
import Admin from '../../../components/auth/Admin';
import { isAuth } from "../../../actions/auth";
import ReadCaseStudies from '../../../components/crud/ReadCaseStudies/ReadCaseStudies';


const CaseStudies = () => {
  const username = isAuth() && isAuth().username;

    return (
      <Layout>
        <Admin>
            <ReadCaseStudies username={username} />
        </Admin>
      </Layout>
    );
  };

export default CaseStudies;