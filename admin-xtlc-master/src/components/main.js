import React, { Component } from 'react';
import {Link} from "react-router-dom";
import './css/main.css';
import io from "socket.io-client";
import Chat from './chat.js';
import InfoPlate from './userInfo.js';

class Main extends Component{
  state = {
      rooms:[],
      current_room:'Admin',
      userInfo:{ 
          author:"-",
          auth_phone:"--",
          auth_contact_number:"---",
          auth_balance:"----",
          auth_tariff_inet:"-----", 
          auth_address:"-----" 
      }
  }

  //подключение к серверу
 socket = io.connect("http://localhost:3000/");

  //создание нового канала
  newUser =  () => {
        this.socket.emit('ADD_USER',"Admin", {
            author:"-",
            auth_phone:"--",
            auth_contact_number:"---",
            auth_balance:"----",
            auth_tariff_inet:"-----",
            auth_address:"-----" 
        }) 
  }
  newConnect =  this.socket.on('connect', this.newUser )

  // Создаем событие "смена комнаты"
  switchRoom = (ev) =>{
      this.socket.emit('SWITCH_ROOM', ev.target.innerText);
      this.setState( {rooms: [], current_room:ev.target.innerText } );          
   };

  //Создаем событие"Удаление комнаты" 
  deleteRoom = () =>  {
      if (this.state.current_room==='Admin') {alert(`don't do it! (◣_◢)`)} 
      else {
          this.setState(  {current_room:'Admin'} ); 
          this.socket.emit('DETELE_ROOM', this.state.current_room)
          this.socket.emit('SWITCH_ROOM', 'Admin')
     } 
  }

  //Получаем и отрисовываем новые комнаты
  changeRoom = (data,data_2) => { 
      if (data_2) 
      {
         localStorage.setItem('current_room', this.state.current_room);
         this.setState( {rooms: [ ...data]} ); 
                  }
          else{ this.setState(  {rooms:[ ...data]} ) } 
  };
  roomListening = this.socket.on('UPDATE_ROOMS', this.changeRoom );

  //Получение информации о клиенте
  userInfo=(data) => { 
      let {author,auth_phone,auth_contact_number,auth_balance,auth_tariff_inet,auth_address} = data
      sessionStorage.setItem('author', author)
      sessionStorage.setItem('auth_phone', auth_phone)
      sessionStorage.setItem('auth_contact_number', auth_contact_number)
      sessionStorage.setItem('auth_balance', auth_balance)
      sessionStorage.setItem('auth_tariff_inet', auth_tariff_inet)
      sessionStorage.setItem('auth_address', auth_address)
      this.setState({ userInfo:
          { author,auth_phone,auth_contact_number,auth_balance,auth_tariff_inet,auth_address }
      }) 
   }
  catchInfo = this.socket.on('USER-INFO', this.userInfo);
      
  //рендеринг скрытого попапа
  createHiddenPopup = () =>  {
      if (this.state.rooms.length > 5) {
        return (
            <div className="chats-row__pop-up-hidden" onClick={this.hiddenList}>
                <ul className= "rooms-list"  >
                    {
                        this.state.rooms.map(room => {
                            if (room===this.state.current_room)
                                { return (<li key={room} className='chats-row__pop-up_active'>{room}</li>) }
                            else
                                { return( <li key={ toString(Symbol()) } className='chats-row__pop-up' onClick={this.switchRoom}>{room}</li>) } 
                        })
                    }
                </ul>
            </div>
        )
      }else{}
  }

  //условие и механизм работы скрытого попапа
  hiddenList = () => {
      if (this.state.isOpen) {
          document.querySelector('.chats-row__pop-up-hidden').style = "transform: rotate(90deg)";
          document.querySelector('.rooms-list').style = "display: none";
          this.setState({isOpen:false})
      }
      else{ 
          document.querySelector('.chats-row__pop-up-hidden').style = "transform: rotate(0deg)";
          document.querySelector('.rooms-list').style = "display: flex";
          this.setState({isOpen:true})
      }      
  }

  render(){
  return(
    <>
        <header className="header">
                <div className="header__leftside">
                    <span className="header__tech-text">Чат тех поддержки</span>
                    <div className="header__wrapper-chats-row ">
                        <div className="header__chats-row chats-row">
                            {
                              this.state.rooms.map(room => {
                                if (room===this.state.current_room) 
                                  { return (<div key={room} className='chats-row__pop-up_active'>{room}</div>) }
                                else
                                  { return( <div key={room} className='chats-row__pop-up' onClick={this.switchRoom}>{room}</div>) }
                              })                              
                            }
                        </div>
                        {this.createHiddenPopup()}
                    </div>
                </div>
        </header>

        <main className="main-chat" >
            <Chat socket= {this.socket}/>
            <div className="main__right-side right-side">
                <div className="right-side__buttons">
                    <p onClick={this.deleteRoom}> Завершить разговор</p>
                    <Link  to="/blanck"><p> Создать заявку</p></Link>
                </div>
                <InfoPlate prop={this.state.userInfo} />
            </div>
        </main>
    </>
    )
  }
}

export default Main;
