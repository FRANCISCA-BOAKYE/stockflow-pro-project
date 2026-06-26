import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';

const THEY_OWE = [
  { id:'1', name:'Kofi Mensah', due:'Jun 30, 2026', amount:85, status:'DUE_SOON' },
  { id:'2', name:'Ama Serwaa', due:'Jun 15, 2026', amount:210, status:'OVERDUE' },
  { id:'3', name:'Kweku Asante', due:'Jul 10, 2026', amount:45, status:'OUTSTANDING' },
];
const I_OWE = [
  { id:'4', name:'Apex Distributors', due:'Jul 5, 2026', amount:3200, status:'OUTSTANDING' },
];
const STATUS = {
  OVERDUE:     { bg:'#FEE2E2', text:'#991B1B', label:'Overdue' },
  DUE_SOON:    { bg:'#FEF3C7', text:'#92400E', label:'Due soon' },
  OUTSTANDING: { bg:'#F3F4F6', text:'#374151', label:'Outstanding' },
  SETTLED:     { bg:'#D1FAE5', text:'#065F46', label:'Settled' },
};
export default function RetailerCreditScreen() {
  const [tab, setTab] = useState('owe_me');
  const data = tab === 'owe_me' ? THEY_OWE : I_OWE;
  const total = data.reduce((s,a) => s+a.amount, 0);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Credit accounts</Text>
        <Text style={styles.sub}>Customer credit tracking</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab==='owe_me'&&styles.tabOn]} onPress={()=>setTab('owe_me')}>
          <Text style={[styles.tabTxt, tab==='owe_me'&&styles.tabTxtOn]}>They owe me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab==='i_owe'&&styles.tabOn]} onPress={()=>setTab('i_owe')}>
          <Text style={[styles.tabTxt, tab==='i_owe'&&styles.tabTxtOn]}>I owe them</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.balanceCard}>
          <Text style={styles.balLbl}>Total outstanding</Text>
          <Text style={styles.balAmt}>${total.toLocaleString('en-US',{minimumFractionDigits:2})}</Text>
          <Text style={styles.balCount}>{data.length} accounts</Text>
        </View>
        <FlatList data={data} keyExtractor={i=>i.id} contentContainerStyle={{gap:8}}
          renderItem={({item})=>{
            const s = STATUS[item.status];
            return (
              <View style={styles.card}>
                <View style={{flex:1}}>
                  <Text style={styles.acctName}>{item.name}</Text>
                  <Text style={styles.acctDue}>Due {item.due}</Text>
                </View>
                <View style={{alignItems:'flex-end'}}>
                  <Text style={styles.acctAmt}>${item.amount.toLocaleString()}</Text>
                  <View style={[styles.pill,{backgroundColor:s.bg}]}>
                    <Text style={[styles.pillTxt,{color:s.text}]}>{s.label}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#EEF2F7'},
  header:{backgroundColor:'#fff',padding:16,paddingBottom:12,borderBottomWidth:0.5,borderBottomColor:'#F3F4F6'},
  title:{fontSize:20,fontWeight:'700',color:'#111827'},
  sub:{fontSize:12,color:'#6B7280',marginTop:2},
  tabs:{flexDirection:'row',backgroundColor:'#fff',borderBottomWidth:0.5,borderBottomColor:'#E5E7EB'},
  tab:{flex:1,alignItems:'center',paddingVertical:12},
  tabOn:{borderBottomWidth:2,borderBottomColor:'#1A56DB'},
  tabTxt:{fontSize:13,color:'#9CA3AF'},
  tabTxtOn:{color:'#1A56DB',fontWeight:'600'},
  body:{flex:1,padding:12},
  balanceCard:{backgroundColor:'#1A56DB',borderRadius:16,padding:18,marginBottom:12},
  balLbl:{fontSize:12,color:'rgba(255,255,255,0.75)',marginBottom:4},
  balAmt:{fontSize:28,fontWeight:'700',color:'#fff'},
  balCount:{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:2},
  card:{backgroundColor:'#fff',borderRadius:16,padding:14,flexDirection:'row',alignItems:'center',shadowColor:'#000',shadowOpacity:0.06,shadowRadius:8,elevation:2},
  acctName:{fontSize:13,fontWeight:'600',color:'#111827'},
  acctDue:{fontSize:11,color:'#6B7280',marginTop:2},
  acctAmt:{fontSize:14,fontWeight:'700',color:'#111827',marginBottom:4},
  pill:{paddingVertical:3,paddingHorizontal:10,borderRadius:20},
  pillTxt:{fontSize:10,fontWeight:'500'},
});

