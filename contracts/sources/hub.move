/// JotunnHub — on-chain video unlock records.
/// Viewers pay HUB_PRICE EVE to unlock a video. Payment goes to treasury.
/// Unlock state is persisted in a shared HubState object so it works cross-device.
module jotunn::hub {
    use sui::coin::{Self, Coin};
    use sui::table::{Self, Table};
    use sui::event;

    const HUB_PRICE: u64 = 100_000_000_000; // 100 EVE (9 decimals)
    const E_INSUFFICIENT_PAYMENT: u64 = 0;
    const E_ALREADY_UNLOCKED: u64 = 1;

    public struct HubState has key {
        id: UID,
        treasury: address,
        unlocks: Table<address, vector<u64>>, // viewer → [video_id, ...]
    }

    public struct VideoUnlocked has copy, drop {
        viewer: address,
        video_id: u64,
    }

    /// Call once after publishing to create the shared HubState.
    public entry fun init_hub(treasury: address, ctx: &mut TxContext) {
        transfer::share_object(HubState {
            id: object::new(ctx),
            treasury,
            unlocks: table::new(ctx),
        });
    }

    /// Pay HUB_PRICE to unlock a video. Change is returned to sender.
    public entry fun unlock_video<T>(
        state: &mut HubState,
        video_id: u64,
        mut payment: Coin<T>,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(&payment) >= HUB_PRICE, E_INSUFFICIENT_PAYMENT);
        let viewer = ctx.sender();

        let exact = coin::split(&mut payment, HUB_PRICE, ctx);
        transfer::public_transfer(exact, state.treasury);

        // Return any change
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, viewer);
        } else {
            coin::destroy_zero(payment);
        };

        // Record unlock
        if (!state.unlocks.contains(viewer)) {
            state.unlocks.add(viewer, vector[]);
        };
        let ids = state.unlocks.borrow_mut(viewer);
        assert!(!ids.contains(&video_id), E_ALREADY_UNLOCKED);
        ids.push_back(video_id);

        event::emit(VideoUnlocked { viewer, video_id });
    }

    /// Read-only check — used by frontend to verify unlock status.
    public fun is_unlocked(state: &HubState, viewer: address, video_id: u64): bool {
        if (!state.unlocks.contains(viewer)) return false;
        state.unlocks.borrow(viewer).contains(&video_id)
    }
}
