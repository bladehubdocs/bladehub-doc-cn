///<reference types="root-ts"/>
type Constructor<T> = {
    new(...args: any[]): T
    name?: string
    type?: string
    path?: string
}


declare namespace StrategyOrderBroker {
    type StrategyBucket = {
        id: string
        name: string
    }
    type StrategyOrderQueryStatus = "all" | "undergo" | "finished"
    type StrategyOrder<T> = {//averagePrice averageAmount phase sum volume back/front account.name:account.sp report
        id: string
        type: string
        name: string,
        strategyBucketId: string
        option?: T
        executorOption?: any
        executorId?: string

        sp?: string
        pair?: string
        averagePrice?: number
        averageAmount?: number
        sum?: any
        volume?: number
        startTime?: number
        phase?: any
        report?: string

        state?: string
        error?: string
    }
    type ExecutorTypes = {
        [type: string]: string
    }
    type ExecutorDefinitions = {
        [type: string]: Definition.ObjectDefinition
    }
}

declare namespace YourService {
    type YourStructure = {
        ownerId: AccountService.AccountId
        name: string
        value: string
        type: string
    }
}

declare namespace APICredential {
    type CredentialAnnotation = {
        name: string
        sp: string
        proxy?: string
        note?: string
    }
    type Credential = MarketCoreService.MarketAPICredential & CredentialAnnotation
    type CypherBlock = {
        tome: string
        data: any
    }
}

declare namespace TradeService {
    type Settings = {}
    type TradeContext = MarketCoreService.TradeContext
    type ShotPoint = MarketCoreService.ShotPoint
    type TradePoint = MarketCoreService.TradePoint
    export interface Environment {
        now(): number
        prepare(requirements: Requirements, callback: Callback<Requirements>)
    }
    export interface DeciderFactory {
        register(Cons: Constructor<Decider>, name?: string)
        create(name: string, option: any, memory?: any)
    }
    export interface ExecutorFactory {
        register(Cons: Constructor<Executor>, name?: string)
        create(decider: Decider, name: string, option: any, memory?: any)
    }
    export type EnvironmentTolerance = {
        // 1. strict, when requirements can't be fullfiled, tick will be skiped
        // 2. manual, even if some of the requirements are not met, still try to make it available
        // default to strict
        requirements: "strict" | "manual"
    }
    export type DeciderDefinition = {
        type: string
        option?: Definition.ObjectDefinition
    }
    export type ExecutorDefinition = {
        type: string
        option?: Definition.ObjectDefinition
    }
    export interface PassiveDecider extends Decider {
        creteExecutor(executorType: string, executorOption: any): string
    }

    export type Decider = {
        id: string
        // name: string
        type: string
        now: number
        isHalt: boolean
        tolerance: EnvironmentTolerance
        tickInterval: number
        previousTick: number
        events: Leaf.EventEmitter<{
            ignite: {
                type: string
                executorId?: string
                option: any
            }
            destroy
        }>
        resume(memory?: any)
        toJSON(): {
            type: string
            id: string
            option: any
            memory: any
        }
        executors: Executor[]
        balance: MarketCoreService.UniverseBalanceManager
        requirements: Requirements
        tick()
        isRunning(): boolean
        toInfo(): DeciderInfo
        toInfoSafe(): DeciderInfo
        destroy()
        halt()
        continue()
        deleteExecutor(executorId: string)
    }
    export type Executor = {
        id: string
        now: number
        tickInterval: number
        tolerance: EnvironmentTolerance
        previousTick: number
        deciderType: string
        deciderId: string
        type?: string
        orders: MarketCoreService.OrderManager
        logger
        tick()
        halt()
        abort()
        continue(): boolean
        resume(memory?: any)
        toJSON(): {
            type: string
            id: string
            deciderId: string
            option: any
            memory: any
        }
        balance: MarketCoreService.UniverseBalanceManager
        requirements: Requirements
        toInfo(): ExecutorInfo
        toInfoSafe(): ExecutorInfo
        isRunning(): boolean
        destroy()
        events: Leaf.EventEmitter<{
            destroy
        }>
    }
    export type Requirement = ShotsRequirement | TradesRequirement | RuntimeRequirement | CurrentShotRequirement | CurrentDepthRequirement | IndexesRequirement | AggregationsRequirement | CurrentAggregationRequirement
    export type Requirements = {
        [name: string]: Requirement
    }
    export type IndexesRequirement = {
        type: "indexes"
        indexes: string[]
        index: {
            [key: string]: number
        }
    }
    export type AggregationsRequirement = {
        type: "aggregations"
        width: number
        rate: number
        duration: number
        context: MarketCoreService.TradeContext
        aggregations: MarketCoreService.AggregationPoint[]
    }
    export type CurrentAggregationRequirement = {
        type: "aggregation"
        width: number
        rate: number
        context: MarketCoreService.TradeContext
        aggregation: MarketCoreService.AggregationPoint
    }
    export type ShotsRequirement = {
        type: "shots"
        context: TradeContext
        duration: number
        datas: ShotPoint[]
    }
    export type TradesRequirement = {
        type: "trades"
        context: TradeContext
        duration: number
        datas: TradePoint[]
    }
    export type RuntimeRequirement = {
        type: "runtime"
        context: TradeContext
        key: string
        secret: string
        runtime: MarketCoreService.ExchangeRuntime
    }
    export type CurrentDepthRequirement = {
        type: "depth"
        context: TradeContext
        depth: MarketCoreService.DepthLevelData[]
    }
    export type OrderBookRequirement = {
        type: "orderBook"
        context: TradeContext
        precision?: number
    }
    export type CurrentShotRequirement = {
        type: "shot"
        context: TradeContext
        shot: ShotPoint
    }
    export type Route = {
        bucketId: string
        deciderId?: string
        executorId?: string
    }
    export type UpdateInfo = {
        route: Route
        state: string
    }
    export type BucketInfo = {
        id: string
        name: string
        isRunning: boolean
        start: number
        end?: number
        sum: MarketCoreService.BalanceList
        volume: MarketCoreService.BalanceList
        deciders: DeciderInfo[]
        stateStatistic?: MarketCoreService.BalanceList
    }
    export type DeciderInfo = {
        id: string
        // name: string
        type: string
        isRunning: boolean
        start?: number
        end?: number
        sum: MarketCoreService.BalanceList
        volume: MarketCoreService.BalanceList
        executors?: ExecutorInfo[]
        stateStatistic?: MarketCoreService.BalanceList
        error?: string
    }
    export type ExecutorInfo = {
        id: string
        type: string
        path?: string
        state: string
        sum: MarketCoreService.BalanceList
        volume: MarketCoreService.BalanceList
        orders?: MarketCoreService.MyOrder[]
        stateStatistic?: MarketCoreService.BalanceList
        position?: MarketCoreService.PositionInfo[]
        error?: string
        log?: string
    }
    export type Bucket = {
        name?: string
        id: string
        env: Environment
        deciderFactory: DeciderFactory
        executorFactory: ExecutorFactory
        events: Leaf.EventEmitter<{
            update
        }>
        toInfo(): BucketInfo
        fromJSON(json: {
            id: string
            name?: string
            executors: {
                type: string
                id: string
                option: any
                memory: any
            }[]
            deciders: {
                type: string
                id: string
                option: any
                memory: any
            }[]
        })
        toJSON(): {
            id: string
            name: string
            executors: {
                type: string
                id: string
                option: any
                memory: any
            }[]
            deciders: {
                type: string
                id: string
                option: any
                memory: any
            }[]
        }
    }
}

declare namespace APIModel {
    type BucketDigest = {
        name: string
        start: number
        summary: any
    }
}

declare namespace MarketCoreService {
    type Settings = {
        market: {
            watch: boolean
            watches: {
                [ServiceProvider: string]: TradePair[]
            }
            credentials: {

                [sp: string]: {
                    key: string
                    secret: string
                }
            }
            units: string[]
        }
    }
    type GlobalMarketContext = {
        createServiceProvider(option: {
            name: string
            key: string
            secret: string
        }): MarketServiceProvider
    }
    type MarketServiceProviderInfo = {
        name: string
        isMarketServiceProvider: true
    }
    // usd/btc/eos ....
    type TradePair = [TradeSide, TradeSide]
    type TradeSide = string
    type TradeContext = {
        name: string // `${sp}_${front}_${back}`
        sp: MarketServiceProviderInfo["name"]
        back: TradeSide
        front: TradeSide
        contract?: string
        reverse?: boolean
    }
    type TradePoint<TMeta = {}> = {
        id?: number
        price: number
        amount: number
        // time is always when the information is gathered by the system
        // not the time provided by the third party
        time: number
        // st is seq time, seq time is time provided by service provider
        st: number

    } & TMeta
    type MyTrade = TradePoint<{

    }>
    type TradePointData = [
        TradePoint["id"],
        TradePoint["price"],
        TradePoint["amount"],
        TradePoint["time"],
        TradePoint["st"]
    ]
    // price,amount,time,count
    type DepthLevelData = [number, number, number, number]
    type BookTableCheckPoint = {
        offset: number
        orders: DepthLevelData[]
        // not include things at time, but any thing before time
        // [ prevTime , time )
        time: number
    }
    type BookTableSource = {
        fromJSON(json: any)
        toJSON(): any
        set(orders: DepthLevelData[])
        push(order: DepthLevelData)
        depth(): DepthLevelData[]
    }
    type Order<TMeta = {}> = {
        // id of the order(service provider side)
        id?: any
        time?: number
        price: number
        amount: number
    } & TMeta

    // Create a interface for easy browser UI implementation
    type GlobalPublicMarketInformationProvider = {
        previous(option: {
            context: TradeContext
            rate: number
            // how long to expand
            duration: number
        })
        requireAggregations(option: {
            context: TradeContext
            rate: number
        }, callback: Callback<null>)
        releaseAggregations(option: {
            context: TradeContext
            rate: number
        }, callback: Callback<null>)
        requireDepth(option: {
            context: TradeContext
        }, callback: Callback<null>)
        releaseDepth(option: {
            context: TradeContext
        }, callback: Callback<null>)
        events: Leaf.EventEmitter<{
            // driven by web api
            aggregations: {
                context: TradeContext
                aggregations: AggregationPoint[]
                width: number
                rate: number
            }
            // driven by web api
            depth: {
                context: TradeContext
                depth: TradeDepth
            }
        }>
    }
    type GlobalMarketProvider = {
        isAvailable(sp: string): boolean
        isActivate(context: TradeContext): boolean
        activateBy(who: any, option: {
            context: TradeContext
            credential?: MarketAPICredential
        }, callback: Callback<null>)
        deactivateBy(who: any, option: {
            context: TradeContext
        }, callback: Callback<null>)
        createOrder(option: {
            context: TradeContext
            market: boolean
            price: number
            amount: number
        }, callback: Callback<MyOrder>)
        cancelOrder(option: {
            context: TradeContext
            pid: string
        }, callback: Callback<MyOrder>)
        events: Leaf.EventEmitter<{
            order: {
                context: TradeContext
                order: MyOrder
            }
            orders: {
                context: TradeContext
                orders: MyOrder[]
            }
            balance: {
                context: TradeContext
                all: BalanceList
                freeze: BalanceList
                available: BalanceList
            }
            loading: TradeContext
            ready: TradeContext
        }>
    }
    type MyOrderState = "pending" | "book" | "partial" | "closed" | "canceled" | "error"
    type MyOrder = Order<{
        sp: string
        back: string
        front: string
        // pid of the order(our side)
        pid?: string
        // client id, bitfinex requires it
        cid?: number
        // which session it is created, if a session is pending
        sid?: number
        // when we decide to create the order, client side time
        intentAt?: number
        // when we confirm the order is created, client side time, it's the time when the create request returns succesfully
        createdAt?: number
        // when we confirmed the order is updated, client side time, when a 
        updatedAt?: number
        // finish time or canceled time
        finishedAt?: number
        // server time of order creation
        serverCreatedAt?: number
        // server time of order update
        serverUpdatedAt?: number
        // state, usually we will disable partial state of the order
        // closeed means we finished the order or partially finished order and end it
        // canceled means for whatever reason we transfer zero liquid, and come to the end of the order
        requestCanceling?: boolean
        fillOrKill?: boolean
        postOnly?: boolean
        market?: boolean
        // pending means we send the request or about to send the request but not confirm it is accepted by remote
        // book means it is accepted by remote at least
        // for canceled/error state. It's promised to have transferedAmount of ZERO
        // only partial/closed can have valid transferedAmount
        // not that when a partial order is closed, it's state is set to "closed".
        // a partial order means, an order is partially filled but is still openned
        state: MyOrderState
        transferedAmount?: number
        transferedPrice?: number
        // any meaning for and fixed text to explain the current situation
        // when it is canceld/error out
        situation?: string
        reason?: string
        //(price,amount,id)[]
        execution?: [number, number, any][]
        // Usually fee is negative
        fee?: BalanceList
        // for some market, order of market pair is fixed
        // the frame work may record a reverse field, so they can correctly handle it
        reverse?: boolean
        // Debug field indicates this order is just for temporary calculation
        temp?: boolean
    }>
    type PositionInfo = {
        sp?: string
        front: string
        back: string
        position: number
        amount: number
        closed: boolean
        realizedPNL: number
    }
    // price / amount
    // PriceAndAmount
    type PAData = [number, number]
    type PA<TExtend = {}> = TExtend & {
        price: number
        amount: number
    }
    //  id, price, amount
    type BookDeltaUpdateData = [any, number, number]

    // Aggregated PriceAndAmount
    type APA = PA<{
        variance?: number
    }>
    type History = {
        context: TradeContext
        start: number
        end: number
        trades?: TradePoint[]
        shots?: ShotPoint[]
        aggregations?: AggregationPoint[]
    }
    type HistoryEntry = {
        context: TradeContext
        prepare()
        whenReady(cb: Function)
        addTrade(tp: TradePoint)
        addTrades(tp: TradePoint[])
        addShot(shot: ShotPoint)
        addShots(shot: ShotPoint[])
        addAggregation(ag: AggregationPoint)
        //addAggregations(ag: AggregationPoint[])
        getHistory(option: {
            start: number
            end: number
            shots?: boolean
            orders?: boolean
            trades?: boolean
            aggregations?: {
                // width
                width: number
                // max sampling rate, number lower the rate larger
                rate: number
            }
        }, callback: Callback<History>)
    }
    // we don't always afford to offer full channel history
    type TradeChannelHistory = TradeContext & {
        start: number
        end: number
        shots?: ShotPoint[]
        // with check point and delta we can build moments
        trades?: TradePoint[]
        aggregations?: AggregationPoint[]
        context: TradeContext
    }
    type TradeChannelHistoryManager = {
        context: TradeContext
        isReady: boolean
        addShot(trade: ShotPoint)
        addTrade(trade: TradePoint)
        addAggregation(agg: AggregationPoint)
        getHistory(option: {
            start: number
            end: number
            shots?: boolean
            orders?: boolean
            trades?: boolean
            aggregations?: {
                // width
                width: number
                // max sampling rate, number lower the rate larger
                rate: number
            }
        }, callback: Callback<TradeChannelHistory>)
    }
    // Order history manager is only for storing old history(likely only used for historical replay)
    // Should be several days before current date
    // Latest orders should be cached by the runtime
    type OrderHistoryManager = {
        updateOrder(order: MyOrder, callback?: Callback<MyOrder>)
        getOrder(query: any, callback: Callback<MyOrder>)
        queryOrders(query: any, callback: Callback<MyOrder>)
    }
    // time sell1,buy1 (sellV,buyV)
    type ShotData = number[]
    type ShotPoint = {
        buy1: number
        sell1: number
        // volume of buy1
        buyV?: number
        // volume of sell1
        sellV?: number
        time: number
        st: number
    }
    type AggregationPoint = {
        // beginPrice
        begin: number
        end: number
        max: number
        min: number
        // sampling level
        // 0~5 => 1min~24h
        // see share/const.ts
        // rate by sampling level
        r?: number
        // width by sampling level
        w?: number
        time: number
        // average price
        // VWAP
        average?: number
        buyAmount?: number
        sellAmount?: number
        totalAmount?: number
        buyVolume?: number
        sellVolume?: number
        totalVolume?: number
        dump?: boolean
    }
    type Moment = ShotPoint & {
        // in case we want the edge price
        edge?: {
            sell: PA
            buy: PA
        }
        // in case we want the aggregation of the edge most several orders
        aggregation?: {
            sell: APA
            buy: APA
        }
    }

    type MarketServiceProvider = MarketServiceProviderInfo & {
        // back use default currency (usdt)
        getTradeChannel(front: TradeSide, back?: TradeSide): TradeChannel
        getExchangeRuntime(front: TradeSide, back?: TradeSide): ExchangeRuntime
    }
    type MarketCredentialProvider = {
        getCredential(sp: string): {
            key: string
            secret: string
        }
    }
    type MarketAPICredential = {
        key: string
        secret: string
    }

    // a runtime channel of certain trade
    type OrderManager = {
        orders: MyOrder[]
        createPid(): string
        queryOneOrder(query: any, ref?: boolean): MyOrder
        getOrder(pid: string, ref?: boolean): MyOrder
        updateOrder(update: MyOrder): MyOrder
        deleteOrder(pid: string): MyOrder
    }
    type DeciderMeta = {
        name: string
        description: string
    }
    // When a runtime is ready, we shall promise the balance is in sync with
    // the remote market.
    type ExchangeRuntime = {
        context: TradeContext
        createOrder(option: {
            price: number
            amount: number
            marketOnly?: boolean
            postOnly?: boolean
        }, callback?: Callback<MyOrder>): MyOrder
        cancelOrder(option: {
            pid: string
        }, callback?: Callback<MyOrder>): MyOrder
        updateOrder?(option: {
            pid: string
            price: number
            amount: number
        }, callback?: Callback<MyOrder>): MyOrder
        getOrder(option: {
            pid: string
        }): MyOrder
        getOrders(): MyOrder[]
        getFee(original: BalanceList): BalanceList
        whenReady(fn: Function)
        destroy()
        events: Leaf.EventEmitter<{
            orders: MyOrder[]
            order: MyOrder
            balance: {
                available: BalanceList
                all: BalanceList
            }
            loading
            ready
        }>
        // emit orders/balance events if any data available
        report()
        getBalance()
    }
    type TradeChannel = TradeContext & {
        context: TradeContext
        isOpen(): boolean
        bookTableSource: BookTableSource
        events: Leaf.EventEmitter<{
            trade: TradePoint
            // partial update of depth
            delta: DepthLevelData[]
            // full sync of depth
            depth: DepthLevelData[]
            // current
            shot: ShotPoint
            // only available when subscribe aggregation
            // promised to update every 10sec, for some platform with websockets support, it should be faster.
            aggregation?: {
                rate: number
                aggregation: AggregationPoint
            }
            aggregations?: {
                rate: number
                aggregations: AggregationPoint[]
            }
            ready: null
        }>
        activate()
        deactivate()
        ensureActivate()
        trackAggregation?(option: {
            rate: number
        }): boolean
        untrackAllAggregations?(): boolean
        // current time of the provider.
        // it is tricky:
        // 1. when running fake dataset, it's a fake time
        // 2. when running real dataset, it's a guessed server time, by calculating the localtime and the lag
        // be aware that this.time is last updated time not the actual this.now()
        now(): number
        getDelay(): number
        getAvailableSampleRate?(): number[]
        getAggregationHistory?(option: {
            start: number
            end: number
            rate: number
        }, callback: Callback<AggregationPoint[]>)
        getAggregationCurrent?(option: {
            rate: number
        }, callback: Callback<AggregationPoint>)
        getCurrentDepth?(option: {
        }, callback: Callback<TradeDepth>)
        shot(): ShotPoint
        destroy()
    }
    type UniverseBalanceList = {
        [sp: string]: BalanceList
    }
    type BalanceList = {
        [name: string]: number
    }
    type OrderBook = {
        asks: PA[]
        bids: PA[]
    }
    type TradeDepth = {
        // amount < 0,  sort by price from small to large
        asks: PA[]
        // amount > 0,  sort by price from small to large
        bids: PA[]
    }
    interface UniverseBalanceManager {
        ensure(sp: string): BalanceManager
        toJSON(): UniverseBalanceList
        fromJSON(data: UniverseBalanceList)
    }
    interface BalanceManager {
        balance: BalanceList
        get(name: string): number
        lock(owner: any, name: string, value: number)
        unlock(owner: any, name: string)
    }
}

declare namespace MarketRelayService {
    export type Settings = {
        relay: {
            domains: string[]
            frequencyPerMin: number
        }
    }
    export interface MarketRelay {
        createWebsocketRelay(option: {
            url: string
        }): WebsocketRelay
        createHttpRelay(option: {
            method: string
            url: string
            payload: string
            headers: any
        }): HttpRelay
    }
    export interface WebsocketRelay {
        send(data: string)
        close()
        events: Leaf.EventEmitter<{
            open
            close
            message: {
                data: any
            }
        }>
    }
    export interface HttpRelay {
        events: Leaf.EventEmitter<{
            response: any
            error: any
        }>
    }
    export type WebsocketRelayEvent = {
        id: string
        name: "open" | "close" | "data"
        data?: any
    }
    export interface ProxySelector {
        get(url: string): string
    }
}

declare namespace WarningService {
    type Settings = {
        warning: {
            debounce: number
            maxDebounce: number
        }
    }
}
declare namespace AnalyseService {
    export type Settings = {
        market: {
            watches: {
                [sp: string]: [string, string][]
            }
        }
    }
}

declare namespace Analysis {
    type TradeContext = MarketCoreService.TradeContext
    interface TradeWatcher {
        events: Leaf.EventEmitter<{
        }>
    }
    interface ShotWatcher {
        events: Leaf.EventEmitter<{
        }>
    }
    interface MarketWatcher {
    }
    interface CoinWatcher {
    }
    interface Analyzer {
        events: Leaf.EventEmitter<{
            "warp/ignite": {
                context: TradeContext,
                warp: Warp
            }
            "warp/pending": {
                context: TradeContext,
                warp: Warp
            }
            "warp/close": {
                context: TradeContext,
                warp: Warp
            }
        }>
    }
    type WarpType = "up" | "down" | "hold"
    interface WarpConfig {
        name?: string
        duration: number
        bp: number
    }
    interface Warp {
        id: number
        start: number
        end: number
        base: MarketCoreService.TradePoint
        reach: MarketCoreService.TradePoint
        close?: MarketCoreService.TradePoint
        config: WarpConfig
        pending: boolean
        grad: number
        duration: number
        bp: number
        closeReason?: string
    }
    interface Peak {
        id: number
        duration: number
        trade: MarketCoreService.TradePoint
        pending: boolean
    }
}

declare namespace DebugUtil {
    interface LogProvider {
        log(...infos: any[])
        error(...infos: any[])
        debug(...infos: any[])
    }
}

declare namespace Definition {
    export type ObjectDefinition = {
        type: "object"
        fields: FieldDefinition[]
    }
    export type FieldDefinition = {
        key: string
        displayName?: string
        value: ValueDefinition
    }
    export type RateDefinition = {
        type: "rate"
        values: {
            name: string,
            value: {
                rate: number,
                width: number
            }
        }[]
    }
    export type TupleDefinition = {
        type: "tuple"
        option: {
            name: string,
            value: ValueDefinition
        }[]
    }
    export type ArrayDefinition<T extends ValueDefinition> = {
        type: "array"
        child: T
    }

    export type StringDefinition = {
        type: "string"
        default?: string
        value?: string
        readonly?: boolean
    }

    export type NumberDefinition = {
        type: "number"
        default?: number
        value?: number
        readonly?: boolean
    }
    export type PasswordDefinition = {
        type: "password"
        default?: string
        value?: string
    }

    export type ValueDefinition = {
        type: string
        option?: any
        values?: any[]
        value?: string
        default?: any
        optional?: false
        readonly?: boolean
    }
    export type DurationgDefinition = {
        type: "duration"
        default?: number
        value?: number
        readonly?: boolean
    }

    export type ExecutorDefinition = {
        type: "executor"
        default?: string
        readonly?: boolean
    }
    export type DeciderDefinition = {
        type: "decider"
        default?: string
        readonly?: boolean
    }
    export type IntDefinition = {
        type: "int"
        default?: number
    }
    export type DurationDefinition = {
        type: "duration"
        default?: number
    }
    export type TradeContextDefinition = {
        type: "tradeContext"
    }
    export type CurrencyDefinition = {
        type: "currency"
    }
    export type SPDefinition = {
        type: "sp"
    }
    export type APICredentialDefinition = {
        type: "apiCredential"
    }

    interface ValueEditor<T = any> {
        isReadonly: boolean
        // set value recursive
        setValue(value: T)
        // get value recursive
        getValue(): T
        readonly()
        setDefinition(def: Definition.ValueDefinition)
    }


    interface DefinitionContext {
        createEditor<T = any>(def: Definition.ValueDefinition): ValueEditor<T>
        register(type: string, Cons: Constructor<ValueEditor>)
    }
}
