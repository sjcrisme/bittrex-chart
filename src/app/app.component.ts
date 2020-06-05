import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, combineLatest, from, merge, Observable, of, Subscription, forkJoin } from 'rxjs';
import { catchError, take, tap, map, switchMap, delay, repeat } from 'rxjs/operators';

import { HttpService } from './services/http.service';

interface CoinInterface {
  Currency: string;
  CurrencyLong: string;
  MinConfirmation?: number;
  TxFee?: any;
  IsActive?: boolean;
  IsRestricted?: boolean;
  CoinType: string;
  BaseAddress?: string;
  Notice?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'test-bitkoins-chart';
  subscription: Subscription;
  listCoins$: Observable<any>;
  liveData$: Observable<any>;
  activeMarkes$: Observable<any>;

  constructor(private  http: HttpService) { }

  ngOnInit() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    // public/getmarkets
    // public/getmarketsummaries
    // public/getcurrencies

    this.listCoins$ = this.http.get('/public/getcurrencies').pipe(
      map((coin) => {
        const coins = [];
        coin.forEach(item => {
          coins.push({
            currency: item.Currency,
            currencyLong: item.CurrencyLong
          });
        });
        return coins;
      })
    );

    this.activeMarkes$ = this.http.get('/public/getmarketsummaries').pipe(
      map(markets => {
        const markestsId = [];
        markets.forEach(item => markestsId.push(item.MarketName));
        return markestsId;
      })
    );

    forkJoin([this.listCoins$, this.activeMarkes$]).pipe(
      map(market => {
        const [coins, grops] = market;
        let mCoins = [];
        coins.forEach(coin => {
          const links = grops.filter(item => item.split('-')[0] === coin.currency);
          if ( links.length) {
            mCoins[coin.currency] = links;
            mCoins[coin.currency].currencyLong = coin.currencyLong;
          }
        });
        return mCoins;
      }),
    ).subscribe(x => console.log('f', x));

    this.subscription = this.http.get('/public/getmarketsummary?market=USD-ETH').pipe(
      delay(5000),
      repeat()
    ).subscribe(x => console.log(x));

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
