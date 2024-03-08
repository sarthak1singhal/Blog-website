import fetch from "isomorphic-fetch";
import { API } from "../config";
import queryString from "query-string";
import { isAuth, handleResponse } from "./auth";

export const createCaseStudy = (caseStudy, token) => {
    let createCaseStudyEndpoint;
  
    if (isAuth() && isAuth().role === 1) {
        createCaseStudyEndpoint = `${API}/portfolio`;
    } else if (isAuth() && isAuth().role === 0) {
        createCaseStudyEndpoint = `${API}/user/portfolio`;
    }
  
    return fetch(`${createCaseStudyEndpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: caseStudy,
    })
      .then((response) => {
        handleResponse(response);
        return response.json();
      })
      .catch((err) => console.log(err));
  };

  export const list = (username) => {
    let listCaseStudyEndpoint;
  
    if (username) {
      console.log(username)
      listCaseStudyEndpoint = `${API}/${username}/portfolio`;
    } else {
      listCaseStudyEndpoint = `${API}/portfolio`;
    }
  
    return fetch(`${listCaseStudyEndpoint}`, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => console.log(err));
  };

  export const removeCaseStudy = (slug, token) => {
    let deleteBlogEndpoint;
  
    if (isAuth() && isAuth().role === 1) {
      deleteBlogEndpoint = `${API}/portfolio/${slug}`;
    } else if (isAuth() && isAuth().role === 0) {
      deleteBlogEndpoint = `${API}/user/portfolio/${slug}`;
    }
  
    return fetch(`${deleteBlogEndpoint}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        handleResponse(response);
        return response.json();
      })
      .catch((err) => console.log(err));
  };