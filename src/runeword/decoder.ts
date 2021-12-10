import { Runeword } from ".";
import { ItemsMainCategoriesType } from "../categories";
import { Branches } from "../data";
import { ItemTypeID } from "../type";
import { buildRarity, createRunewordModsMerger, getAttributes, getModsFromToken, getPerfectionAndShorthand, includeCommunityRequests } from "./decoder-parts";
import { createEmptyItem } from "./runeword";


export function decodeItem(tokenId: string) {
    if (!tokenId || parseInt(tokenId) === 0 || Number.isNaN(parseInt(tokenId))) return {
        tokenId,
        details: {},
        branches: {},
        shorthand: '',
        mods: [],
        attributes: [],
        perfection: null,
        category: ItemsMainCategoriesType.WEAPONS,
        slots: [],
        meta: {
          harvestYield: 0,
          harvestFeeToken: '',
          harvestFeePercent: 0,
          harvestFees: {},
          chanceToSendHarvestToHiddenPool: 0,
          chanceToLoseHarvest: 0,
          harvestBurn: 0,
        },
      }
    
    const version = parseInt(tokenId.slice(1, 4))
    const id = parseInt(tokenId.slice(4, 9));
    const type = version === 1 ? 0 : parseInt(tokenId.slice(9, 11)) as ItemTypeID;
    const modStart = version === 1 ? 9 : 11;
    let runewordInTheBuild: Partial<Runeword> = createEmptyItem(tokenId, id, type);
    const branchAttributes = (runewordInTheBuild.branches as Branches)["1"].attributes
    const mods = getModsFromToken(tokenId, id, modStart, branchAttributes)
    
    const attributes = getAttributes(id, mods, runewordInTheBuild.attributes || [], branchAttributes);
    runewordInTheBuild = {
        ...runewordInTheBuild,
        mods,
        attributes, 
        version
    }
    const applyMetaAndMergeAttributes = createRunewordModsMerger(attributes);
    const {perfection, shorthand} = getPerfectionAndShorthand((runewordInTheBuild.branches as Branches)["1"], attributes);
    const rarity = runewordInTheBuild.rarity || buildRarity(attributes, perfection || 0);
    const applyCommunityRequests = includeCommunityRequests(tokenId)
    runewordInTheBuild = applyMetaAndMergeAttributes(runewordInTheBuild as Runeword)
    runewordInTheBuild = {
        ...runewordInTheBuild, 
        rarity,
        perfection,
        shorthand
    }
    return applyCommunityRequests(runewordInTheBuild as Runeword)
}