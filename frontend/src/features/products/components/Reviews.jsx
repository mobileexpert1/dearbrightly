import React from 'react';
import styled from 'react-emotion';
import LazyLoad from 'react-lazyload';
import { Row, Col } from 'reactstrap';

import { mobileFirstBreakpoints, fontFamily, fontWeight } from "src/variables"

const rating = 'https://d2ndcoyp4lno8u.cloudfront.net/star_rating.png';

const ReviewSection = styled('section')`
  padding: 45px 0;
  display: flex;
  justify-content: center;

  ${mobileFirstBreakpoints.lg} {
    padding: 60px 0;
  }

	.reviews-inner {
		max-width: 800px;
		margin: auto;

		.title-block {
			@media (min-width: 768px) {
				text-align: left;
			}
		}
		.col-md-6 {
			display: flex;
		}

		.reviews-box {
			padding: 15px 15px;
			background: rgb(250, 248, 247);
			margin-bottom: 25px;

			@media (min-width: 768px) {
			}

			.reviews-image {
				img {
					width: 100%;
					height: 50px;
					width: 50px;
					border-radius: 50%;
					margin-bottom: 15px;
				}
			}
			.reviews-content {
				position: relative;

				.rating-icon {
					width: 90px;
					position: absolute;
					right: 20px;
					top: 0;
				}
				.reviews-name {
					font-size: 17px;
					line-height: 24px;
					color: #000;
					margin-bottom: 4px;
				}
				.reviews-date {
					font-size: 17px;
					line-height: 24px;
					color: #000;
				}
				p {
					font-size: 16px;
					line-height: 19px;
					color: #000;
					margin: 25px 0 10px;
				}
			}
		}

		.pagination-block {
			.pagination {
				li {
					a {
						width: 32px;
						height: 32px;
						line-height: 32px;
						text-align: center;
						display: inline-block;
						color: #000;
						padding: 0;
						border-radius: 50%;
						border: 0;
						margin-right: 1px;

						&.active {
							background: #000;
							color: #fff;
						}
					}
				}
			}
		}
	}
`;

const Heading2 = styled('h2')`
	font-family: ${fontFamily.baseFont};
	font-weight: ${fontWeight.bold};
	font-size: 28px;
	line-height: 32px;
	letter-spacing: 0.08px;
	margin-bottom: 20px;
	@media (max-width: 768px) {
		text-align: center;
		margin: 0 auto;
		max-width: 250px;
	}
`;

export default class Reviews extends React.Component {
	constructor(props) {
		super(props);
		this.state = { currentPage: 1 };
	}

	renderPageOne() {
		return (
      <Row>
				<Col md={6}>
					<div className="reviews-box">
						<LazyLoad offset={ 30 } once>
							<div className="reviews-image">
								<img src="https://d2ndcoyp4lno8u.cloudfront.net/Lynne_Review.jpg" />
							</div>
						</LazyLoad>
						<div className="reviews-content">
							<h4 className="reviews-name">DB Member</h4>
							<LazyLoad offset={ 30 } once>
								<img src={ rating } className="rating-icon" />
							</LazyLoad>
							<p>
								I just turned 30 this year and I don't think my skin has ever looked
								better. Plain and simple: I love Dear Brightly and I thank them for
								educating me on how to take care of my self!
							</p>
						</div>
					</div>
				</Col>
	      <Col md={6}>
		      <div className="reviews-box">
			      <LazyLoad offset={ 30 } once>
				      <div className="reviews-image">
					      <img src="https://d2ndcoyp4lno8u.cloudfront.net/ben_review.jpg" />
				      </div>
			      </LazyLoad>
			      <div className="reviews-content">
				      <h4 className="reviews-name">DB Member</h4>
				      <LazyLoad offset={ 30 } once>
					      <img src={rating} className="rating-icon" />
				      </LazyLoad>
				      <p>
					      Ok, I have to say, this was a gamechanger for me. I don't enjoy
					      going out of my way to visit the doc's office, so being able to
					      easily communicate with one and get my retinoid via Dear Brightly
					      was so nice.
				      </p>
			      </div>
		      </div>
	      </Col>
      </Row>
		);
	}

	renderPageTwo() {
		return (
      <Row>
	      <Col md={6}>
		      <div className="reviews-box">
			      <LazyLoad offset={ 30 } once>
				      <div className="reviews-image">
					      <img src="https://d2ndcoyp4lno8u.cloudfront.net/virginia_review.jpg" />
				      </div>
			      </LazyLoad>
			      <div className="reviews-content">
				      <h4 className="reviews-name">DB Member</h4>
				      <LazyLoad offset={ 30 } once>
					      <img src={rating} className="rating-icon" />
				      </LazyLoad>
				      <p>
					      This salve is one of the top 3 products I've ever used on my face,
					      hands down. It's lightweight yet super hydrating and the moisture
					      lasts all day (and night!). It fills in and plumps up those fine
					      wrinkles around my eyes. I also have Sjogren's syndrome and this
					      salve has helped me combat that tremendously.
				      </p>
			      </div>
		      </div>
	      </Col>
	      <Col md={6}>
		      <div className="reviews-box">
			      <LazyLoad offset={ 30 } once>
				      <div className="reviews-image">
					      <img src="https://d2ndcoyp4lno8u.cloudfront.net/user.svg" />
				      </div>
			      </LazyLoad>
			      <div className="reviews-content">
				      <h4 className="reviews-name">DB Member</h4>
				      <LazyLoad offset={ 30 } once>
					      <img src={rating} className="rating-icon" />
				      </LazyLoad>
				      <p>
					      I've known for a while that I should be using retinoids to keep my
					      skin looking good, but getting them always seemed like wayyyyy too
					      much effort–all of the good derms have long waiting lists and, as a
					      guy, I always felt a shy about asking my doctor. So Dear Brightly
					      was a godsend!
				      </p>
			      </div>
		      </div>
	      </Col>
      </Row>
		);
	}

	renderPageThree() {
		return (
      <Row>
				<Col md={6}>
					<div className="reviews-box">
						<LazyLoad offset={ 30 } once>
							<div className="reviews-image">
								<img src="https://d2ndcoyp4lno8u.cloudfront.net/beth_review.jpg" />
							</div>
						</LazyLoad>
						<div className="reviews-content">
							<h4 className="reviews-name">DB Member</h4>
							<LazyLoad offset={ 30 } once>
								<img src={rating} className="rating-icon"/>
							</LazyLoad>
							<p>
								I've used retinoids in the past, but there's something about DB's
								serum that has done wonders. My skin is brighter, firmer and I've
								received random compliments that my skin is glowing! Never going
								back.
							</p>
						</div>
					</div>
				</Col>
				<Col md={6}>
					<div className="reviews-box">
						<LazyLoad offset={ 30 } once>
							<div className="reviews-image">
								<img src="https://d2ndcoyp4lno8u.cloudfront.net/user.svg" />
							</div>
						</LazyLoad>
						<div className="reviews-content">
							<h4 className="reviews-name">DB Member</h4>
							<LazyLoad offset={ 30 } once>
								<img src={rating} className="rating-icon" />
							</LazyLoad>
							<p>
								I have been stressing about my skin for years - never knowing who to
								ask, what to use, and how to assess all the options out there. Dear
								Brightly was incredibly trustworthy, easy to use, and I've been
								seeing results! My skin is brighter, more clear, and fresh-looking.
								I recommend this to anyone in their 20s and eager to get started on
								an effective and simple skincare regimen.
							</p>
						</div>
					</div>
				</Col>
      </Row>
		);
	}

	renderPageFour() {
		return (
      <Row>
				<Col md={6}>
					<div className="reviews-box">
						<LazyLoad offset={ 30 } once>
							<div className="reviews-image">
								<img src="https://d2ndcoyp4lno8u.cloudfront.net/user.svg" />
							</div>
						</LazyLoad>
						<div className="reviews-content">
							<h4 className="reviews-name">DB Member</h4>
							<LazyLoad offset={ 30 } once>
								<img src={rating} className="rating-icon" />
							</LazyLoad>
							<p>
								I’m a Db customer and love the results that I’m seeing from
								retinoids and the moisturizer. (Even my fiancé noticed, so that’s a
								big deal). My skin is smoother, brighter and much softer now! I did
								have some dry skin and peeling in the beginning, but that’s normal
								as a result of cell turnover. I’m so glad Dear Brightly exists!!
							</p>
						</div>
					</div>
				</Col>
      </Row>
		);
	}

	setCurrentPage = (currentPage, e) => {
		e.preventDefault();
		this.setState({ currentPage });
	};

	getContentToRender(currentPage) {
		switch (currentPage) {
			case 1:
				return this.renderPageOne();
			case 2:
				return this.renderPageTwo();
			case 3:
				return this.renderPageThree();
			case 4:
				return this.renderPageFour();
			default:
				return this.renderPageOne();
		}
	}

	render() {
		const { currentPage } = this.state;

		return (
      <ReviewSection className="reviews-sec">
				<div className="container">
					<div className="reviews-inner">
						<div className="title-block">
							<Heading2>Why the DB community loves us</Heading2>
						</div>

						{this.getContentToRender(currentPage)}

						<div className="reviews-block clearfix">
							<div className="pagination-block">
								<ul className="pagination">
									<li className="page-item">
										<a
											className={ currentPage === 1 ? 'page-link active' : 'page-link' }
											href="#"
											onClick={e => this.setCurrentPage(1, e)}
										>
											1
										</a>
									</li>
									<li className="page-item">
										<a
											className={ currentPage === 2 ? 'page-link active' : 'page-link' }
											href="#"
											onClick={e => this.setCurrentPage(2, e)}
										>
											2
										</a>
									</li>
									<li className="page-item">
										<a
											className={ currentPage === 3 ? 'page-link active' : 'page-link' }
											href="#"
											onClick={e => this.setCurrentPage(3, e)}
										>
											3
										</a>
									</li>
									<li className="page-item">
										<a
											className={ currentPage === 4 ? 'page-link active' : 'page-link' }
											href="#"
											onClick={e => this.setCurrentPage(4, e)}
										>
											4
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
      </ReviewSection>
		);
	}
}
