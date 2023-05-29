"use client";

import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import randomWord from "@/utils/passwds";

import {
  Button,
  Card,
  Grid,
  Input,
  Spacer,
  Select,
  Pagination,
  useInput,
  Modal,
  useToasts,
  Loading
} from "@geist-ui/core";


import { Table } from "@/components/table";
import { ChangeEventHandler, useEffect, useState } from "react";
import styles from "./user.module.css"
import { userColumn, orderColumns } from "@/app/[area]/items";




type Area = "user" | "order";
type Range<T> = [T, T];
type ValuePiece = Date | null;
type Value = ValuePiece | Range<ValuePiece>;

export default function Page({
  params,
}: {
  params: {
    area: Area;
  };
}) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursor, setCursor] = useState<number>(0);
  const [count, setCount] = useState<number>(100);
  const [key, setKey] = useState<string>("");
  const [plan, setPlan] = useState<string|string[]>("free")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [startsAt, setStartsAt] = useState<number>()
  const [endsAt, setEndsAt] = useState<number>()
  const { setToast } = useToasts();
  const { data, isLoading } = useSWR(
    `/api/${params.area}?cursor=${cursor}&count=${count}&key=${key}` as string,
    (url) => fetcher(url).then((res) => res.json())
 );
  // const [data, setData] = useState([
  //   {"subscriptions": [],"invitationCodes": [],"name": "zhangwu0760@163.com","passwordHash": "8ddf80e245f1d213221f19bc65dd2796","resetChances": 0,"role": "user", "createdAt": 1684733536310,"isBlocked": false,"lastLoginAt": 1684733536310},
  //   {"subscriptions": [],"invitationCodes": [],"name": "zhangwu0760@163.com","passwordHash": "8ddf80e245f1d213221f19bc65dd2796","resetChances": 0,"role": "user", "createdAt": 1684733536310,"isBlocked": false,"lastLoginAt": 1684733536310},
  //   {"subscriptions": [],"invitationCodes": [],"name": "zhangwu0760@163.com","passwordHash": "8ddf80e245f1d213221f19bc65dd2796","resetChances": 0,"role": "user", "createdAt": 1684733536310,"isBlocked": false,"lastLoginAt": 1684733536310},
  const [showForm, setShowForm] = useState(false);
  const {
    state: searchUser,
    setState: setSearchUser,
    reset,
    bindings: bindSearchUser,
  } = useInput("");

  useEffect(() => {}, [searchUser]);
  const [value, onChange] = useState(new Date());
  let columns;
  switch (params.area) {
    case "user":
      columns = userColumn;
      break;
    case "order":
      columns = orderColumns;
      break;
    default:
      return <p>404</p>;
  }
  const pageChange = (page: number) => {
    const gap = page - currentPage;
    if (gap < 0) {
      setCurrentPage(0);
      setCount(Math.abs(gap) * 10);
    }
    // setCount();
  };

  const handleSearch = () => {
    setKey(searchUser);
  };

  const addNewUser = () => {
    setShowForm(true)
  }

  const handleRowClick = (rowData: any, rowIndex: number) => {
    console.log(rowData, rowIndex)
  }

  const closeHandler = () => {
    setShowForm(false)
    console.log('closed')
  }
  if (isLoading) return <Loading />;

  console.log(data)

  const handleDateStart:ChangeEventHandler<HTMLInputElement> = (ele) => {
   
    const fmt  = new Date(ele.target.value)
    setStartsAt(fmt.getTime())
  }
  const handleDateEnds:ChangeEventHandler<HTMLInputElement> = (ele) => {
    const fmt  = new Date(ele.target.value)
     setEndsAt(fmt.getTime())
  }
  const handleSubmit = () => {
    if (!email || !name || !password || !plan || !startsAt || !endsAt) {
      setToast({text:"请填写完整"});
    }
    registerProcess()
  }
  const createPass = () => {
    const pas = randomWord(8)
    setPassword(pas)
  }
  const registerProcess = async () => {
    const data = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, plan,name, startsAt, endsAt }),
    });

    if (data.ok) {
      setToast({ text: "添加成功" });
    }
  }

  return (
    <Grid.Container gap={2} justify="center">
      <Grid xs={12}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input label="用户名" placeholder="" {...bindSearchUser} />
            <Spacer w={5} />
            <Select placeholder="订阅计划">
              <Select.Option value="1">Free</Select.Option>
              <Select.Option value="2">Pro</Select.Option>
              <Select.Option value="3">Premium</Select.Option>
            </Select>
            <Spacer w={5} />

            <Button loading={isLoading} onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </Card>
      </Grid>
      <Grid xs={24}>
        <Button loading={isLoading} onClick={addNewUser}> 新增用户</Button>
      </Grid>
      <Grid xs={24}>
        <Table tableColumn={columns} tableData={data?.data?.data} onClick={handleRowClick}/>
      </Grid>
      {/*<Grid xs={12}>*/}
      {/*  <Pagination page={currentPage} initialPage={1} onChange={pageChange} />*/}
      {/*</Grid>*/}
      <Modal visible={showForm} onClose={closeHandler} width="40rem">
        <Modal.Title>编辑信息</Modal.Title>
        <Modal.Content>
            <Input label="邮箱账户" placeholder="用作登录" width="100%" required name="email" onChange={(e) => {setEmail(e.target.value);}}/>
            <Spacer w={5} />
            <Input label="用户名称" placeholder="用作显示" width="100%" required name="name" onChange={(e) => {
          setName(e.target.value);
        }}/>
            <Spacer w={5} />
            <Grid.Container style={{alignItems: "center"}}>
              <Input label="登录密码" value={password} placeholder="登录密码" required name="password" onChange={(e) => {
                setPassword(e.target.value);
              }}/>
              <Button onClick={createPass}>随机密码</Button>
            </Grid.Container>
            <Spacer w={5} />
            <Grid.Container style={{alignItems: "center"}}>
              <span className={styles["span-left"]}>订阅计划</span>
              <Select placeholder="订阅计划" initialValue={plan} onChange={(e)=>{setPlan(e)}}>
              <Select.Option value="1">Free</Select.Option>
              <Select.Option value="2">Pro</Select.Option>
              <Select.Option value="3">Premium</Select.Option>
            </Select>
            </Grid.Container>
            <Spacer w={5} />
            <Grid.Container style={{alignItems: "center"}}>
              <span className={styles["span-left"]}>订阅时长</span>
              <Grid xs style={{alignItems: "center"}}>
                <input type="date" 
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                className={styles["date-picker"]} onChange={handleDateStart}/>
                <Spacer w={3}/>至<Spacer w={3}/>
                <input type="date" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" className={styles["date-picker"]} onChange={handleDateEnds}></input>
              </Grid>
            </Grid.Container>
        </Modal.Content>
        <Modal.Action passive onClick={({ close }) => close()}>取消</Modal.Action>
        <Modal.Action onClick={handleSubmit}>添加</Modal.Action>
      </Modal>
    </Grid.Container>
  );
}
