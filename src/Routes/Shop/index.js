import React from 'react';
import axios from 'axios';
import './index.css';

export default class Shop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            items: [],
            balance: 0,


            isConfirmPopoutShowed: false,
            selectedItem: 0,
            selectedItemInd: -1
        };

        this.renderItems = this.renderItems.bind(this);
        this.onCanceled = this.onCanceled.bind(this);
        this.onConfirmed = this.onConfirmed.bind(this);
    }


    componentDidMount() {
        axios.get("/api/v1/shop/get_items").then((res) => {
            console.log(res.data);
            this.setState({
                loading: false,
                items: res.data.items,
                balance: res.data.balance
            })
        })

        console.log(this.state);
    }

    renderItems() {
        return (
            this.state.items.map((element, ind) =>
                <div className="column" key={ind}>
                    <div className="ui left aligned fluid card">
                        <div className="image">
                            <img src={element.Image} alt="Item preview"/>
                        </div>
                        <div className="content">
                            <p className="header">{element.Name}</p>
                            <p className="meta">{element.Description}</p>
                        </div>
                        <div className="extra content">
                            <div
                                className={(element.CanBuy) ? "ui animated fade positive button" : "ui animated fade positive button disabled"}
                                onClick={() => {
                                    this.onClickItem(element.ID, ind)
                                }} tabIndex="0">
                                <div className="hidden content">{element.Cost} RUB</div>
                                <div className="visible content">
                                    <i className="shop icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    }


    onClickItem(itemID, ind) {
        this.setState({
            isConfirmPopoutShowed: true,
            selectedItem: itemID,
            selectedItemInd: ind
        });
        window.jQuery("#confirmModal").modal('show');
    }

    closeClosestMessage() {
        window.jQuery(this).closest(".message").fadeOut(300, function() {
            window.jQuery(this).remove()
        })
    }

    onConfirmed() {
        console.log(this.state.items[this.state.selectedItemInd])
        this.setState({
            isConfirmPopoutShowed: false
        });

        let dimmer = window.jQuery("<div id='loadingDimmer' class='ui active dimmer'><div class='ui text loader'>Loading</div></div>");
        window.jQuery("body").append(dimmer);

        axios.get("/api/v1/shop/buy_item", {
            params: {
                itemID: this.state.items[this.state.selectedItemInd].ID
            }
        }).then((res)=> {
            this.setState({
                selectedItem: 0,
                selectedItemInd: -1
            });
            window.jQuery("#loadingDimmer").remove()
            this.showMessage("success", "Your buy has been complete. Now page will reload")
            window.location.reload();
        }).catch((err)=> {
            this.showMessage("error", "Your buy has not been complete. Try later :(")
            window.jQuery("#loadingDimmer").remove()
        })
    }

    onCanceled() {
        this.setState({
            isConfirmPopoutShowed: false,
            selectedItem: 0,
            selectedItemInd: -1
        })
    }

    //success
    //error
    showMessage(status, text) {
        let jQuery = (window.jQuery !== undefined) ? window.jQuery : window.$
        var n = jQuery('<div class="ui ' + status + ' message hidden"><i class="close icon"></i>' + text + "</div>");
        n.find(".close.icon").click(this.closeClosestMessage());
        jQuery("#messages-container").append(n);
        n.slideDown(300)
    }

    renderMain() {
        return (
            <div>
                <div className="ui segment">
                    <div className="Shop--up">
                        <h3>Kurikku!Shop</h3>

                        <div className="Shop--rightContainer">
                            <h3 className="Shop--right">
                                {this.state.balance} RUB
                            </h3>
                            <div class="ui positive button">
                                <a href="/donate"><i className="plus icon"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="ui divider"/>

                    <div className="ui three column left aligned stackable grid">
                        {this.renderItems()}
                    </div>
                </div>


                <div id="confirmModal" className="ui basic modal">
                    <div className="ui icon header" style={{color: 'white'}}>
                        <i className="archive icon"></i>
                        Do you Confirm your Payment
                    </div>
                    <div className="actions">
                        <div className="ui red cancel button" onClick={this.onCanceled}>
                            <i className="remove icon"></i>
                            Close
                        </div>
                        <div className="ui green ok button" onClick={this.onConfirmed}>
                            <i className="checkmark icon"></i>
                            Confirm
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    render() {
        return (
            (this.state.loading) ?
                <div className="ui active dimmer">
                    <div className="ui text loader">Loading</div>
                </div>
                :
                this.renderMain()
        )
    }
}