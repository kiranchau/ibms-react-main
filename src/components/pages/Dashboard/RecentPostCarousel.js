/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import * as MdIcons from 'react-icons/md';
import { convertToLink, getNameInitials } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import NODATA from "../../../images/not-found.jpg"
import { useNavigate } from "react-router-dom";
import ForumsDocs from './ForumsDocs';
import { TfiNewWindow } from "react-icons/tfi";
import { Tooltip } from 'antd';
const RecentPostCarousel = ({ dashboardData }) => {
  const [cardNumber, setCardNumber] = useState(1)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 576) {
        setCardNumber(1);
      } else {
        setCardNumber(2);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const [recentForums, setRecentForums] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth <= 576) {
      setCardNumber(1);
    } else {
      setCardNumber(2);
    }
  }, [])

  // Sample data for cards
  const cardData = [
    { id: 1, title: 'First Card', description: 'This is the description of the first card.' },
    { id: 2, title: 'Second Card', description: 'This is the description of the second card.' },
    { id: 3, title: 'Third Card', description: 'This is the description of the third card.' },
    { id: 4, title: 'Fourth Card', description: 'This is the description of the fourth card.' }
  ];

  useEffect(() => {
    if (dashboardData) {
      setRecentForums(dashboardData?.recent_forums ? dashboardData.recent_forums : "");
    }
  }, [dashboardData])

  const navigateToCollabHub = () => {
    navigate("/forums")
  }

  const renderCarouselItems = (cardData) => {

    const carouselItems = [];
    for (let i = 0; i < cardData.length; i += cardNumber) {
      const chunk = cardData.slice(i, i + cardNumber);
      carouselItems.push(
        <Carousel.Item key={i}>
          <Container fluid className='bg-post-color'>
            <div className='inner-widget '>
              <Row>
                {chunk.map(card => {
                  return (
                    <Col key={card.post_id} sm={6} onClick={() => { navigateToCollabHub() }}>
                      <div className='widget-card'>
                        <div className='user-info'>
                          <div className='user-profile'>
                            {getNameInitials(card?.user?.first_name, card?.user?.last_name)}
                          </div>
                          <div className='user-name-category'>
                            <h5>{card?.user?.first_name ? card?.user?.first_name : ""} {card?.user?.last_name ? card?.user?.last_name : ""}</h5>
                            <p>{card?.category_details?.length > 0 ? card?.category_details[0].name : ""}</p>

                          </div>
                          <p className='post-time'>Posted on {parseDateTimeString(card?.created_at, 11)}</p>
                        </div>
                        <div className='post-content'>
                          <p className='post-title'>{card?.post_title}</p>
                          <p className='description' dangerouslySetInnerHTML={{ __html: convertToLink(card?.description) }}></p>
                        </div>
                        <ForumsDocs card={card} />
                      </div>
                    </Col>)
                })}
              </Row>
            </div>
          </Container>
        </Carousel.Item>
      );
    }
    return carouselItems;
  };

  return (
    <div className="my-carousel-container recent-post-widget widget-container">
      <div className='header'>
        <div className='header-content'>
          <MdIcons.MdForum />
          <h4>Recent Posts</h4>
        </div>
        <Tooltip title="Go to Collabhub">
          <TfiNewWindow onClick={() => { navigateToCollabHub() }} />
        </Tooltip>
      </div>
      {recentForums.length > 0 ? <Carousel nextIcon={<FaChevronRight />} prevIcon={<FaChevronLeft />}>
        {renderCarouselItems(recentForums)}
      </Carousel> : <div className="no-data">
        {/* <img src={NODATA} /> */}
        <div className="no-data">
          <img src={NODATA} />
          <p>There are no recent posts.</p>
        </div>
      </div>}
    </div>
  );
};

export default RecentPostCarousel;
