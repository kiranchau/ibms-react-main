import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import "../../SCSS/dashboard.scss";
import Button from "../../commonModules/UI/Button";
import BgCover from "../../commonModules/UI/BgCover";
import recentForum from "../../../images/Login/recentForum.png";
import postImage from "../../../images/Login/pexels-pixabay-60597.jpg";
import * as RiIcons from "react-icons/ri";
import { fetchForumPosts } from "../../../API/authCurd";
import { parseDateTimeString } from "../../../Utils/dateFormat";
import { MdOutlineCardMembership } from "react-icons/md";

const Dashcol5 = (props) => {
  const [forumPosts, setForumPosts] = useState([]);
  const navigate = useNavigate()

  // function getForumPosts() {
  //   fetchForumPosts().then((res) => {
  //     setForumPosts(res.data.posts)
  //   }).catch(() => setForumPosts([]))
  // }

  useEffect(() => {
    if(props.dashboardData?.recent_forums){
      setForumPosts(props.dashboardData?.recent_forums)
    }else{
      setForumPosts([])
    }
    // getForumPosts()
  }, [props.dashboardData])

  const onReplyButtonClick = () => {
    navigate("/forums")
  }

  return (
    <div className="Row2Hgt dashboard-hot-post">
      <div className="p-3 negheading">
        
      </div>
        <div className="TablePad">
        <div className="d-flex align-items-center px-3 py-3">
          <div className="heading "><MdOutlineCardMembership style={{width:'26px',height:'26px',marginRight:'10px'}}/>Hot Posts</div>
        </div>
          <div className="tableView">
            <div className="px-3 py-0">
              {
                forumPosts.map((forum, index) => (
                  <div className="mb-3 post-wrap">
                    <div className="px-2 hot-post">
                      <div className="header">
                        <div className="user-profile">
                            <span>SA</span>
                        </div>
                        <div>
                          <div className="Pstheading">
                            {forum.user?.customer_id ? forum.user?.customer_details?.name : ""} <span>{`${forum.user?.first_name ? forum.user.first_name : ""} ${forum.user?.last_name ? forum.user.last_name : ""}`}</span>
                          </div>
                          <div className="date">{parseDateTimeString(forum.created_at, 3)}</div>

                        </div>
                      </div>
                      <p className="mb-1">
                        {forum.post_title}
                      </p>
                      <div className="media-post">
                      <img src={postImage} alt="" />
                      </div>
                      {/* <div className="pstend d-flex justify-content-end ">
                        <div>
                          <Button className="rplyBtn" onClick={onReplyButtonClick}>
                            Reply{" "}
                            <RiIcons.RiShareForwardFill className="icons myicon" />
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashcol5;
