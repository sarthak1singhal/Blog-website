import { useState, useEffect } from "react";
import FormInput from "../../FormInput/FormInput";
import { withRouter } from "next/router";
import { getCookie, isAuth } from "../../../actions/auth";
import { getCategories } from "../../../actions/category";
import { getTags } from "../../../actions/tag";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { createCaseStudy } from "../../../actions/caseStudy";


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CreateCaseStudy = ({ router }) => {
    
    const [categories, setCategories] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [checkedTags, setCheckedTags] = useState([]);
    
    useEffect(() => {
        setValues({ ...values, formData: new FormData() });
        initCategories();
      }, [router]);
    
      // initialize categories state
      const initCategories = () => {
        getCategories().then((data) => {
          if (data.error) {
            setValues({ ...values, error: data.error });
          } else {
            setCategories(data);
          }
        });
      };
    

    const handleBody = (e) => {
        // console.log(e);
        // push the event into body
        setBody(e);
    
        // populate form data
        formData.set("body", e);
    
        // save to local storage to prevent data loss on page refresh
        if (typeof window !== "undefined") {
          localStorage.setItem("casestudy", JSON.stringify(e));
        }
      };

    const getCaseStudyDataFromLocalStorage = () => {
        if (typeof window === "undefined") {
          return false;
        }
    
        if (localStorage.getItem("casestudy")) {
          return JSON.parse(localStorage.getItem("casestudy"));
        } else {
          return false;
        }
      };
  
    const [body, setBody] = useState(getCaseStudyDataFromLocalStorage ());
    const [values, setValues] = useState({
        error: "",
        sizeError: "",
        success: "",
        formData: "",
        title: "",
        imageUrl: "",
        logoUrl: "",
        website: "",
        mdesc: "",
        hidePublishBtn: false,
      });
    
      const token = getCookie("token");
      const { error, sizeError, success, formData, title, hidePublishBtn, imageUrl, logoUrl, website, mdesc } = values;

      const handleCategoryToggleCheckbox = (categoryId) => () => {
        setValues({ ...values, error: "" });
    
        const allCheckedCategories = [...checkedCategories];
    
        // get the index of current checked category
        const checkedCategory = checkedCategories.indexOf(categoryId);
    
        // if the current checked category is not in the state, add it
        // else remove the category from the state
        if (checkedCategory === -1) {
          allCheckedCategories.push(categoryId);
        } else {
          allCheckedCategories.splice(checkedCategory, 1);
        }
    
        setCheckedCategories(allCheckedCategories);
        formData.set("categories", allCheckedCategories);
    
        console.log(allCheckedCategories);
      };

      const notifyError = () => {
        toast(<h3 className="toast-error">{error}</h3>, {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 5000,
          closeButton: false,
          hideProgressBar: true,
        });
        setValues({ ...values, error: false });
      };
    
      const notifySuccess = () => {
        toast(<h3 className="toast-success">{success}</h3>, {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 5000,
          closeButton: false,
          hideProgressBar: true,
        });
        setValues({ ...values, success: "" });
      };

      const handleChange = (name) => (e) => {
        const value = name === "photo" ? e.target.files[0] : e.target.value;
        // form data to be processed by the backend to create a new blog
        formData.set(name, value);
        setValues({ ...values, [name]: value, formData, error: "" });
      };

      const publishCaseStudy = (e) => {
        e.preventDefault();
        createCaseStudy(formData, token).then((data) => {
          if (data.error) {
            setValues({ ...values, error: data.error });
          } else {
            setValues({
              ...values,
              title: "",
              error: "",
              success: `A new Case Study titled "${data.title}" was created`,
            });
            setBody("");
            setCheckedCategories([]);
            setCheckedTags([]);
          }
        });
      };

    return (
        <section className="create-blog">
          <h4 className="create-blog__title">Create new case Study</h4>
    
          <div className="create-blog__wrapper">
            <form onSubmit={publishCaseStudy}>
              <FormInput
                type="text"
                value={title}
                label="CaseStudy Title"
                onChange={handleChange("title")}
                required
              />
              <FormInput
                type="text"
                value={imageUrl}
                label="Image URL"
                onChange={handleChange("imageUrl")}
                required
              />
              <FormInput
                type="text"
                value={logoUrl}
                label="Logo URL"
                onChange={handleChange("logoUrl")}
                required
              />
              <FormInput
                type="text"
                value={website}
                label="Website URL"
                onChange={handleChange("website")}
                required
              />
              <FormInput
                type="text"
                value={mdesc}
                label="mdesc"
                onChange={handleChange("mdesc")}
                required
              />
              <div className="form-group">
                <ReactQuill
                  modules={CreateCaseStudy.modules}
                  formats={CreateCaseStudy.formats}
                  bounds={".quill"}
                  value={body}
                  placeholder="Write something amazing..."
                  onChange={handleBody}
                />
              </div>
    
              <button type="submit" className="create-blog__publish-btn">
                PUBLISH
              </button>
            </form>
            <div>
              <div className="form-group create-blog__featured-image">
                <h5 className="create-blog__featured-image-title">
                  Featured Image
                </h5>
              </div>
              <div>
                <div className="create-blog__categories">
                  <h5 className="create-blog__categories-title">Categories</h5>
                  <ul style={{ maxHeight: "120px", overflowY: "scroll" }}>
                    {categories &&
                      categories.map((category) => (
                        <li key={category._id}>
                          <input
                            onChange={handleCategoryToggleCheckbox(category._id)}
                            type="checkbox"
                            
                          />
                          <label className="form-check-label">
                            {category.name}
                          </label>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="notify-message">
            {success ? notifySuccess() : null}
            {error ? notifyError() : null}
          </div>
        </section>
      );
}

CreateCaseStudy.modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { header: [3, 4, 5, 6] }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
      ["code-block"],
    ],
  };
  
  CreateCaseStudy.formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
    "video",
    "code-block",
  ];

export default withRouter(CreateCaseStudy);