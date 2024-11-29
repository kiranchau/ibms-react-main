/* eslint-disable no-self-assign */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useContext, useEffect, useRef, useState } from "react";
import "../../SCSS/forumlayout.scss";
import { FaRegImage } from "react-icons/fa6";
import { Form } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { DatePicker } from 'antd';
import { GetUsers, addForumPost, deleteForumPost, fecthUsersWithType, fetchDepartments, fetchForumPosts, fetchForumPostsForLazyLoad, fetchForumTopicCategories, fetchHotPosts } from "../../../API/authCurd";
import { calculatePageCount, calculatePageRange, checkPermission, getFilterFromLocal, getNameInitials, moveSelectedToTop, saveFilterToLocal, separateAndTransformIdsWithZero } from "../../../Utils/helpers";
import { FilterFilled } from '@ant-design/icons';
import { MdCancel } from "react-icons/md";
import NotFound from "../../../images/not-found.jpg"
import ForumPost from "./ForumPost";
import { forumSchema, validateFormData } from "../../../Utils/validation";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import Button from '../../commonModules/UI/Button';
import RichTextEditor from '../../commonModules/UI/RichTextEditor';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import HotPost from "./HotPost";
import { LuPin } from "react-icons/lu";
import { sortByConcatenatedString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { paginationInitialPage } from "../../../Utils/pagination";
import dayjs from "dayjs"
import 'dayjs/locale/en';
// import { MentionsInput, Mention } from "react-mentions";
import ForumRichTextEditor from "../../commonModules/UI/ForumRichTextEditor";
const paginationPerPage = 10

const ForumsLayout = () => {
  const { RangePicker } = DatePicker;
  const [foumPosts, setForumPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [formattedForumPosts, setFormattedForumPosts] = useState([]);
  const [fileType, setFileType] = useState([]);
  const [forumTopicCategories, setForumTopicCategories] = useState([]);
  const [filePop, setFilePop] = useState(false);
  const [formValues, setFormValues] = useState({
    post_title: "",
    description: "",
    photos: [],
    category_id: "",
    editorValue: "",
    mentions: []
  })
  const [rangePickerValue, setRangePickerValue] = useState([])
  const [userFilter, setUserFilter] = useState([])
  const [filter, setFilter] = useState({
    user: [],
    category: [],
    range: [null, null]
  })
  const [formError, setFormError] = useState({})
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const [toggleCategory, setToggleCategory] = useState(false)
  const [toggleUser, setToggleUser] = useState(false)
  const togglerRef = useRef()
  const navigate = useNavigate()
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const descRef = useRef(null)
  const [filters, setFilters] = useState({
    user_id: [],
    category_id: [],
    global_search: "",
    start_date: "",
    end_date: ""
  })
  const [taggingList, setTaggingList] = useState([])
  const [ibUsers, setIbUsers] = useState([])
  const [cleartext, setClearText] = useState("")
  // const [departments, setDepartments] = useState([]);

  // fetch IB users // 2: IB Users
  // const getCustomerIbUsers = () => {
  //   fecthUsersWithType(2).then((res) => {
  //     if (res.data?.users) {
  //       let users = res?.data?.users?.map((item) => ({
  //         id: item.id,
  //         // display: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`,
  //         value: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`,
  //       }))
  //       // setIbUsers(sortObjectsByAttribute(users, "display"))
  //       setIbUsers(sortObjectsByAttribute(users, "value"))
  //     }
  //   }).catch(() => { setIbUsers([]) })
  // }

  // // Get Departments function
  // const getDepartments = () => {
  //   fetchDepartments().then((res) => {
  //     if (res.data?.departments) { setDepartments(res.data?.departments) }
  //   })
  //     .catch(() => { setDepartments([]) })
  // }

  useEffect(() => {
    let permission = checkPermission("CollabHub")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  // useEffect(() => {
  //   let deps = departments.map((item) => ({
  //     id: -item.id,
  //     // display: `${item?.name}`,
  //     value: `${item?.name}`,
  //   }))
  //   // let depsList = sortObjectsByAttribute(deps, "display")
  //   let depsList = sortObjectsByAttribute(deps, "value")
  //   setTaggingList([{ id: 0, display: "All Company" }, ...depsList, ...ibUsers])
  // }, [ibUsers, departments])

  function getTaggingList() {
    Promise.all([fetchDepartments(), fecthUsersWithType(2)]).then((response) => {
      let list = [[{ id: 0, value: "All Company" }]]
      response.forEach((res) => {
        if (res.data.departments) {
          let deps = res?.data?.departments?.map((item) => ({
            id: -item.id,
            value: `${item?.name}`,
          }))
          list.push(sortObjectsByAttribute(deps, "value"))
        } else if (res.data.users) {
          let users = res?.data?.users?.map((item) => ({
            id: item.id,
            value: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`,
          }))
          list.push(sortObjectsByAttribute(users, "value"))
        }
      })
      setTaggingList(list.flat())
    }).catch(() => setTaggingList([]))
  }

  useEffect(() => {
    getTaggingList()
  }, [])

  useEffect(() => {
    console.log("TagggingList: ", taggingList)
  }, [taggingList])

  const toggleButton = document.querySelectorAll(".show-all-comments");
  const popups = document.querySelectorAll(".child-comment");

  function togglePopup(popup) {
    popup.classList.remove("hidden");
  }
  // Event listeners for toggle buttons
  toggleButton.forEach((button, index) => {
    button.addEventListener("click", () => {
      const closestPopup = popups[index];
      if (closestPopup) {
        togglePopup(closestPopup);
      }
    });
  });

  // Add Post Input onChange handler
  const inputOnChangeHandler = (e) => {
    let descElem = descRef?.current
    if (descElem) {
      descElem.style = "auto"
      descElem.style.height = (descElem.scrollHeight) + "px";
    }
    let err = formError
    if (err.hasOwnProperty(e.target.name)) {
      delete err[e.target.name]
    }
    setFormError(err)
    if (e.target.name == "photos") {
      let oldFiles = formValues.photos ? formValues.photos : []
      let files = Object.keys(e.target.files).map((file) => e.target.files[file])
      let concatenatedArr = [...oldFiles, ...files]
      setFileType(concatenatedArr);
      setFormValues({ ...formValues, photos: concatenatedArr })
    } else {
      setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }
  }

  const mentionsOnChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
    let ids = mentions ? mentions.map(m => m.id) : []
    setFormValues({ ...formValues, description: newPlainTextValue, editorValue: newValue, mentions: ids })
  }

  // Selected image delete
  const onClearFileBtnClick = (e, index) => {
    let newArr = formValues.photos.filter((_, i) => i !== index)
    setFormValues({ ...formValues, photos: newArr })
    setFileType(newArr);
  }

  // Post button click handler
  async function onPostButtonHandler() {
    const { userIds, deptIds } = separateAndTransformIdsWithZero(formValues.mentions)
    const formData = new FormData();
    if (formValues.photos) {
      formValues.photos.forEach((file, index) => {
        formData.append(`photo${index + 1}`, file)
      })
      formData.append('image_type', 1)
    }
    formData.append('post_title', formValues.post_title)
    formData.append('description', formValues.description)
    formData.append('category_id', formValues.category_id)
    formData.append('mentions', userIds)
    formData.append('group_mentions', deptIds)
    validateFormData(forumSchema, formValues).then(() => {
      addNewForumPostData(formData)
    }).catch((err) => {
      setFormError(err)
    })
  }

  // Get forum posts
  function getForumPosts() {
    fetchForumPosts().then((res) => {
      setForumPosts(res.data.posts)
    }).catch(() => setForumPosts([]))
  }

  // Forum post for lazy load
  function getForumPostsForLazyLoading(perPage, pageNum, searchParams) {
    let search = JSON.stringify(searchParams)
    fetchForumPostsForLazyLoad(perPage, pageNum, search).then((res) => {
      setForumPosts(res.data.posts?.data)
      let pageCount = calculatePageCount(res.data?.posts.total, res.data?.posts.per_page)
      setPaginationData({
        current_page: res.data?.posts.current_page,
        prev_page_url: res.data?.posts.prev_page_url,
        next_page_url: res.data?.posts.next_page_url,
        per_page: res.data?.posts.per_page,
        total: res.data?.posts.total,
        pagesCount: pageCount
      })
    }).catch(() => setForumPosts([]))
  }

  // Get hot post
  function getHotPosts() {
    fetchHotPosts().then((res) => {
      setHotPosts(res.data["hot-posts"])
    }).catch(() => setHotPosts([]))
  }

  // Add new forum post
  function addNewForumPostData(data) {
    addForumPost(data).then((res) => {
      setClearText("clear")
      getForumPosts()
      setFileType([]);
      setFormValues({ description: "", photos: [], category_id: "", post_title: "", editorValue: "", mentions: [] })
      let descElem = descRef?.current
      if (descElem) {
        descElem.style = "auto"
        descElem.style.height = "42px";
      }
    }).catch((err) => { console.log("addForumPost-err: ", err.message) })
  }

  function deleteForumPostData(id) {
    deleteForumPost(id).then((res) => {
      getForumPosts()
    }).catch(() => setForumPosts([]))
  }

  const getForumTopicCategories = () => {
    fetchForumTopicCategories().then((res) => {
      if (res.data?.forum_topic_categories) { setForumTopicCategories(res.data?.forum_topic_categories) }
    }).catch(() => { setForumTopicCategories([]) })
  }

  function onRangePickerChangeHandler(value, datestring) {
    if (datestring?.[0] == "" && datestring?.[1] == "") {
      let fils = { ...filters, start_date: "", end_date: "" }
      let { global_search, ...saveFilter } = fils
      saveFilterToLocal('collabhub', saveFilter)
      getForumPostsForLazyLoading(paginationPerPage, paginationData.current_page, fils)
    }
    setRangePickerValue(value)
    let fils = { ...filters, start_date: datestring[0], end_date: datestring[1] }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('collabhub', saveFilter)
    setFilters((prev) => ({ ...prev, start_date: datestring[0], end_date: datestring[1] }))
    setFilter({ ...filter, range: datestring })
  }

  function onUserCheckboxChangeHandler(e) {
    let users = filter.user
    if (users.includes(e.target.dataset.userid)) {
      users = users.filter((u) => { return u != e.target.dataset.userid })
    } else {
      users.push(e.target.dataset.userid)
    }
    setFilters((prev) => ({ ...prev, user_id: users }))
    setFilter({ ...filter, user: users })
  }

  function onCategoryChangeHandler(e) {
    let categories = filter.category
    if (categories.includes(e.target.dataset.categoryid)) {
      categories = categories.filter((c) => { return c != e.target.dataset.categoryid })
    } else {
      categories.push(e.target.dataset.categoryid)
    }
    setFilters((prev) => ({ ...prev, category_id: categories }))
    setFilter({ ...filter, category: categories })
  }

  // Date range picker onChange handler
  function datePickerOnBlurHandler(value, datestring) {
    resetSearch()
    let fils = { ...filters }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('collabhub', saveFilter)
    getForumPostsForLazyLoading(paginationPerPage, paginationData.current_page, filters)
  }

  // Get user list function
  function getUsersList() {
    GetUsers().then((res) => {
      if (res.data?.users) {
        let users = res?.data.users?.map((item) => {
          return {
            id: item.id,
            name: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`,
            first_name: item?.first_name ? item?.first_name : "",
            last_name: item?.last_name ? item?.last_name : ""
          }
        })
        let savedFilters = getFilterFromLocal('collabhub')
        let userIds = savedFilters?.user_id ? savedFilters?.user_id?.map(userId => parseInt(userId)) : []
        const sortedOptions = moveSelectedToTop(users, 'name', userIds)
        setUserFilter(sortedOptions)
      } else {
        setUserFilter([])
      }
    }).catch(() => {
      setUserFilter([])
    })
  }

  useEffect(() => {
    getUsersList()
    // getCustomerIbUsers()
    // getDepartments()
  }, [])

  useEffect(() => {
    getHotPosts()
    getForumTopicCategories()
  }, [])

  useEffect(() => {
    if (globalSearch) {
      let searchParams = {
        category_id: [], user_id: [], start_date: "", end_date: "",
        global_search: globalSearch?.trim()
      }
      setRangePickerValue([])
      setFilters(searchParams)
      setFilter({ user: [], category: [], range: [null, null] })
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('collabhub', saveFilter)
      getForumPostsForLazyLoading(paginationPerPage, paginationInitialPage, searchParams)
    } else {
      let savedFilters = getFilterFromLocal('collabhub')
      let searchParams = {
        ...filters,
        category_id: savedFilters?.category_id ? savedFilters?.category_id : [],
        user_id: savedFilters?.user_id ? savedFilters?.user_id : [],
        start_date: savedFilters?.start_date ? savedFilters?.start_date : "",
        end_date: savedFilters?.end_date ? savedFilters?.end_date : "",
        global_search: ""
      }
      setFilters(searchParams)
      setRangePickerValue([savedFilters?.start_date ? dayjs(savedFilters?.start_date) : null, savedFilters?.end_date ? dayjs(savedFilters?.end_date) : null])
      setFilter({
        user: savedFilters?.user_id ? savedFilters?.user_id : [],
        category: savedFilters?.category_id ? savedFilters?.category_id : [],
        range: [null, null]
      })
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('collabhub', saveFilter)
      getForumPostsForLazyLoading(paginationPerPage, paginationInitialPage, searchParams)
    }
  }, [globalSearch])

  const onHotpostClickHandler = (hotPost) => {
    const element = document.getElementById(`forum-post-number-${hotPost.post_id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleOnPageChange = (pageNumber) => {
    getForumPostsForLazyLoading(paginationData.per_page, pageNumber, filters)
  }

  const formatData = (isUserReset, isCategoryReset) => {
    let formattedData = foumPosts
    setFormattedForumPosts(formattedData)
  }

  useEffect(() => {
    formatData()
  }, [filter.range, foumPosts, globalSearch])

  const onCategoryOkBtnClick = () => {
    resetSearch()
    let fils = { ...filters }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('collabhub', saveFilter)
    getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
    setToggleCategory(false)
  }

  const onCategoryResetHandler = () => {
    setFilter({ ...filter, category: [] })
    setFilters((prev) => ({ ...prev, category_id: [] }))
    let search = { ...filters, category_id: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('collabhub', saveFilter)
    getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, search)
    setToggleCategory(false)
  }

  const onUserOkBtnClick = () => {
    resetSearch()
    let fils = { ...filters }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('collabhub', saveFilter)
    getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
    setToggleUser(false)
    let userIds = filters?.user_id ? filters?.user_id?.map(userId => parseInt(userId)) : []
    const sortedOptions = moveSelectedToTop(userFilter, 'name', userIds)
    setUserFilter(sortedOptions)
  }

  const onUserResetHandler = () => {
    setFilter({ ...filter, user: [] })
    setFilters((prev) => ({ ...prev, user_id: [] }))
    let search = { ...filters, user_id: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('collabhub', saveFilter)
    getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, search)
    setToggleUser(false)
    const sortedOptions = moveSelectedToTop(userFilter, 'name', [])
    setUserFilter(sortedOptions)
  }

  const rteOnChangeHandler = (value) => {
    let err = formError
    if (err.hasOwnProperty("description")) {
      delete err["description"]
    }
    setFormError(err)
    setClearText("")
    setFormValues((prev) => ({ ...prev, description: value }))
  }

  const rteMentionOnChangeHandler = (mentions) => {
    let ids = mentions ? mentions.map(m => m.id) : []
    setFormValues((prev) => ({ ...prev, mentions: ids }))
  }

  return (
    <div className="PageContent d-flex align-items-center justify-content-center py-2 forum-container">
      <div className="forumcontainer">
        <div className="addpost-section left-section">
          <div className="card p-2 mb-2 new-post-wrap">
            <div className="new-post ">
              <div>
                <div className="user-profile">
                  <span className="initial-text">{getNameInitials(localStorage.getItem('first_name'), localStorage.getItem('last_name'))}</span>
                </div>
              </div>
              <div className="text-editor-wrap">
                <div className="text-editor">
                  <input
                    type="text"
                    id="exampleFormControlInput1"
                    placeholder="Add Title Here...."
                    className="form-control input-style title-input-style "
                    value={formValues.post_title}
                    name="post_title"
                    onChange={inputOnChangeHandler}
                  />

                </div>
                {/* <div className="text-editor">
                  <MentionsInput
                    value={formValues.editorValue}
                    onChange={mentionsOnChangeHandler}
                    style={{ width: "100%", height: "100px" }}
                    placeholder="Type @ to tag users..."
                    className="add-post-editor"
                  >
                    <Mention
                      trigger="@"
                      data={taggingList}
                      displayTransform={(id, display) => { return `@${display} ` }}
                    />
                  </MentionsInput>
                </div> */}
                <ForumRichTextEditor
                  taggingList={taggingList}
                  onChange={rteOnChangeHandler}
                  mentionOnChange={rteMentionOnChangeHandler}
                  cleartext={cleartext}
                />
              </div>
              <div className="error-text-wrap">
                {formError?.post_title ? <span className='ms-2 text-danger'>{formError?.post_title}</span> : null}
                {formError?.description ? <span className='ms-2 text-danger'>{formError?.description}</span> : null}
              </div>
            </div>
            <div>
            </div>
            {fileType?.length > 0 && <div className="post-upload-image-wrap ">{
              fileType?.map((file, index) => {
                if (file?.type?.startsWith("image")) {
                  return (<div className="post-upload-image ">
                    <img key={index} className="" src={URL.createObjectURL(file)} alt="upload image" />
                    <MdCancel onClick={(e) => onClearFileBtnClick(e, index)} />
                  </div>)
                } else {
                  return <div>
                    <span key={index} className="mt-1">{file?.name}</span>
                    <MdCancel onClick={(e) => onClearFileBtnClick(e, index)} />
                  </div>
                }
              })}
            </div>}
            <div className="editor-footer">
              <div className="upload-doc">
                <>
                  <label htmlFor="fileInput" className="custom-file-input upload-btn">
                    <FaRegImage /> Attachments
                    <input
                      id="fileInput"
                      type="file"
                      multiple={true}
                      name="photos"
                      onChange={inputOnChangeHandler}
                    />
                  </label>

                </>
                <div className="category-select-box">
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    name="category_id"
                    value={formValues.category_id ?? ""}
                    onChange={inputOnChangeHandler}
                  >
                    <option key={0} value="">Category</option>
                    {forumTopicCategories.map((item) => {
                      return <option key={item.id} value={item.id}>{item.name}</option>
                    })}
                  </select>
                </div>
                {formError?.category_id ? <span className='ms-2 text-danger'>{formError?.category_id}</span> : null}
              </div>
              <div className="post-btn-wrap">
                <button className=" button" type="button" onClick={onPostButtonHandler}>Post</button>
              </div>
            </div>
          </div>
          <div className="">
            <div className="filter-wrap">
              <Dropdown id="category_filter_dropdown" show={toggleCategory} onToggle={() => { setToggleCategory(!toggleCategory) }}>
                <Dropdown.Toggle ref={togglerRef} variant="primary" id="dropdown-basic" className="filter-btn">
                  <span>Category</span> <FilterFilled className={filter?.category?.length > 0 ? "filter-yellow-color" : ""} />
                </Dropdown.Toggle>
                <Dropdown.Menu id="category_filter_dropdown_menu">
                  <Form className="px-2">
                    {sortObjectsByAttribute(forumTopicCategories).map((item) => {
                      return <Form.Check
                        key={item.id}
                        type="checkbox"
                        // id="checkbox-example"
                        data-categoryid={item.id}
                        onChange={onCategoryChangeHandler}
                        label={item.name}
                        checked={filter.category.includes(`${item.id}`)}
                      />
                    })}
                  </Form>
                  <div className="btn-wrap">
                    <button type="button" className="filter-reset-btn" onClick={onCategoryResetHandler}>Reset</button>
                    <button type="button" className="filter-ok-btn" onClick={() => { onCategoryOkBtnClick() }}>Ok</button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown show={toggleUser} onToggle={() => { setToggleUser(!toggleUser) }}>
                <Dropdown.Toggle variant="primary" id="dropdown-basic" className="filter-btn">
                  <span>User</span> <FilterFilled className={filter?.user?.length > 0 ? "filter-yellow-color" : ""} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Form className="px-2">
                    {userFilter?.map((user) => {
                      return <Form.Check
                        key={user.id}
                        type="checkbox"
                        data-userid={user.id}
                        onChange={onUserCheckboxChangeHandler}
                        label={`${user?.first_name ? user?.first_name : ""} ${user?.last_name ? user?.last_name : ""}`}
                        checked={filter.user.includes(`${user.id}`)}
                      />
                    })}
                  </Form>
                  <div className="btn-wrap">
                    <button type="button" className="filter-reset-btn" onClick={onUserResetHandler}>Reset</button>
                    <button type="button" className="filter-ok-btn" onClick={onUserOkBtnClick}>Ok</button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              <RangePicker format={'MM/DD/YYYY'} value={rangePickerValue} onCalendarChange={onRangePickerChangeHandler} onBlur={datePickerOnBlurHandler} />
            </div>
          </div>
          <div className="addpost-section-inner">
            {formattedForumPosts.length > 0 ?
              formattedForumPosts.map((post) => {
                return post?.description ? <ForumPost
                  key={post.post_id}
                  post={post}
                  getForumPosts={getForumPosts}
                  deleteForumPostData={deleteForumPostData}
                  paginationData={paginationData}
                  getForumPostsForLazyLoading={getForumPostsForLazyLoading}
                  filters={filters}
                  getHotPosts={getHotPosts}
                  ibUsers={ibUsers}
                  taggingList={taggingList}
                /> : null
              }) :
              <div className="not-found-wrap">
                <img src={NotFound} width={150} alt="not found" />
                <h4>Post Not Found</h4>
              </div>
            }

          </div>
          <div className="text-end d-flex justify-content-between align-items-center pagination-wrap">
            <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
            <Pagination showSizeChanger={false} current={paginationData.current_page} pageSize={paginationData.per_page} onChange={handleOnPageChange} total={paginationData.total} />
          </div>
        </div>
        <div className="right-section widget-wrap">
          <div className="recent-comment-wrap">
            <div className="card">
              <h5><LuPin className="me-3 pin-icon" />Pinned Posts</h5>
              <div className="card-inner">
                {hotPosts.length > 0 ?
                  hotPosts.map((hpost) => {
                    return hpost.description ? <HotPost
                      hpost={hpost}
                      onClick={onHotpostClickHandler}
                    /> : null
                  }) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {filePop && <div className={`${"centerpopups"}`}>
        <div className='centerpopups add-pass-modal'>
          <div className='popups d-flex justify-content-center align-items-center w-100'>
            <div className='addpopups user-form-wrap collabhub-popup activity-log'>
              <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                <div> Post</div>
                <div className='myIcon' type='button' >
                  <IoIosCloseCircle onClick={() => setFilePop(!filePop)} style={{ width: '28px' }} />
                </div>
              </div>
              <div className='popBody p-3 customer-body'>
                <div className="category-container">
                  <FloatingLabel label="Category *">
                    <Form.Select
                      aria-label="Default select example"
                      name="category_id"
                      value={formValues.category_id ?? ""}
                      onChange={inputOnChangeHandler}
                    >
                      <option key={0} value="">Category</option>
                      {forumTopicCategories.map((item) => {
                        return <option key={item.id} value={item.id}>{item.name}</option>
                      })}
                    </Form.Select>
                  </FloatingLabel>
                  {formError?.category_id ? <span className='ms-2 text-danger'>{formError?.category_id}</span> : null}
                </div>
                <div className="">
                  <RichTextEditor />
                </div>
              </div>
              <div className='mt-auto popfoot w-100 p-2'>
                <div className='d-flex align-items-center justify-content-center'>
                  <Button className="mx-4 cclBtn" >Cancel</Button>
                  <Button type="submit" onClick={onPostButtonHandler} >Post {false && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="blurBg"></div>
        </div>
      </div>}
    </div>
  );
};

export default ForumsLayout;
