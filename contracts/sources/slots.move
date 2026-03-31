/// Void Slots — on-chain slot machine with provably fair RNG via sui::random.
/// Bets go into a shared house pool. Winners are paid out from the pool.
/// Admin funds the pool via fund_house.
module jotunn::slots {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::random::{Self, Random, RandomGenerator};
    use sui::event;

    public struct SlotsHouse<phantom T> has key {
        id: UID,
        treasury: address,
        pool: Balance<T>,
    }

    public struct SpinResult has copy, drop {
        player: address,
        reel1: u8,
        reel2: u8,
        reel3: u8,
        bet: u64,
        payout: u64,
    }

    /// Call once after publishing. T = EVE coin type. Treasury receives any unclaimable wins.
    public entry fun init_slots<T>(treasury: address, ctx: &mut TxContext) {
        transfer::share_object(SlotsHouse<T> {
            id: object::new(ctx),
            treasury,
            pool: balance::zero<T>(),
        });
    }

    /// Admin deposits EVE into the house pool to fund potential payouts.
    public entry fun fund_house<T>(house: &mut SlotsHouse<T>, deposit: Coin<T>) {
        house.pool.join(coin::into_balance(deposit));
    }

    /// Spin the slots. Uses sui::random (object 0x8) for provably fair RNG.
    /// Pass Random object as argument in the PTB.
    public entry fun spin<T>(
        house: &mut SlotsHouse<T>,
        bet: Coin<T>,
        rand: &Random,
        ctx: &mut TxContext,
    ) {
        let bet_amount = coin::value(&bet);
        let player = ctx.sender();

        let mut gen = random::new_generator(rand, ctx);
        let r1 = weighted_symbol(&mut gen);
        let r2 = weighted_symbol(&mut gen);
        let r3 = weighted_symbol(&mut gen);

        let payout = calc_payout(r1, r2, r3, bet_amount);

        // Accept bet into pool
        house.pool.join(coin::into_balance(bet));

        // Pay out if pool can cover
        if (payout > 0 && house.pool.value() >= payout) {
            let win = coin::from_balance(house.pool.split(payout), ctx);
            transfer::public_transfer(win, player);
        };

        event::emit(SpinResult { player, reel1: r1, reel2: r2, reel3: r3, bet: bet_amount, payout });
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    /// Symbol weights: Jotunn=1, Skull=2, Ship=3, Fuel=4, Star=5 (total 15)
    fun weighted_symbol(gen: &mut RandomGenerator): u8 {
        let roll = random::generate_u8_in_range(gen, 0, 14);
        if (roll == 0) 0           // Jotunn (jackpot, 1/15)
        else if (roll <= 2) 1      // Skull  (2/15)
        else if (roll <= 5) 2      // Ship   (3/15)
        else if (roll <= 9) 3      // Fuel   (4/15)
        else 4                     // Star   (5/15)
    }

    fun calc_payout(r1: u8, r2: u8, r3: u8, bet: u64): u64 {
        if (r1 == r2 && r2 == r3) {
            let mult: u64 = if (r1 == 0) 20
                else if (r1 == 1) 10
                else if (r1 == 2) 5
                else if (r1 == 3) 3
                else 2;
            bet * mult
        } else if (r1 == r2 || r2 == r3 || r1 == r3) {
            bet / 2
        } else {
            0
        }
    }
}
